﻿// Copyright 2014 The Rector & Visitors of the University of Virginia
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

using System;
using System.Collections.ObjectModel;
using System.Collections.Generic;
using SensusUI.UiProperties;
using System.Collections.Specialized;
using System.Threading;
using System.Linq;
using SensusUI.Inputs;
using System.Threading.Tasks;
using Plugin.Geolocator.Abstractions;
using SensusService.Probes.Location;

namespace SensusService.Probes.User
{
    public class ScriptRunner
    {
        /// <summary>
        /// It shouldn't matter if the rerun events lag behind. Participation does not depend on them and
        /// time needs to elapse before incomplete scripts accumulate.
        /// </summary>
        private const bool RERUN_CALLBACK_LAG = true;

        private string _name;
        private ScriptProbe _probe;
        private Script _script;
        private bool _enabled;
        private bool _allowCancel;
        private ObservableCollection<Trigger> _triggers;
        private Dictionary<Trigger, EventHandler<Tuple<Datum, Datum>>> _triggerHandler;
        private Queue<Script> _invalidScripts;
        private bool _rerunInvalidScripts;
        private string _rerunCallbackId;
        private int _rerunDelayMS;
        private int _maximumAgeMinutes;
        private int _numScriptsAgedOut;
        private List<Tuple<DateTime, DateTime>> _randomTriggerWindows;
        private string _randomTriggerCallbackId;
        private Random _random;
        private List<DateTime> _runTimes;
        private List<DateTime> _completionTimes;
        private bool _oneShot;
        private bool _runOnStart;
        private bool _displayProgress;

        private readonly object _locker = new object();

        #region properties

        public ScriptProbe Probe
        {
            get
            {
                return _probe;
            }
            set
            {
                _probe = value;
            }
        }

        public Script Script
        {
            get
            {
                return _script;
            }
            set
            {
                _script = value;
            }
        }

        [EntryStringUiProperty("Name:", true, 1)]
        public string Name
        {
            get { return _name; }
            set { _name = value; }
        }

        [OnOffUiProperty("Enabled:", true, 2)]
        public bool Enabled
        {
            get
            {
                return _enabled;
            }
            set
            {
                if (value != _enabled)
                {
                    _enabled = value;

                    if (_probe != null && _probe.Running && _enabled) // probe can be null when deserializing, if set after this property.
                        Start();
                    else if (SensusServiceHelper.Get() != null)  // service helper is null when deserializing
                        Stop();
                }
            }
        }

        [OnOffUiProperty("Allow Cancel:", true, 3)]
        public bool AllowCancel
        {
            get
            {
                return _allowCancel;
            }
            set
            {
                _allowCancel = value;
            }
        }

        public ObservableCollection<Trigger> Triggers
        {
            get { return _triggers; }
        }

        public Queue<Script> InvalidScripts
        {
            get { return _invalidScripts; }
        }

        [OnOffUiProperty("Rerun Invalid Scripts:", true, 5)]
        public bool RerunInvalidScripts
        {
            get { return _rerunInvalidScripts; }
            set
            {
                if (value != _rerunInvalidScripts)
                {
                    _rerunInvalidScripts = value;

                    if (_probe != null && _probe.Running && _enabled && _rerunInvalidScripts) // probe can be null when deserializing, if set after this property.
                        StartRerunCallbacksAsync();
                    else if (SensusServiceHelper.Get() != null)  // service helper is null when deserializing
                        StopRerunCallbacksAsync();
                }
            }
        }

        [EntryIntegerUiProperty("Rerun Delay (MS):", true, 6)]
        public int RerunDelayMS
        {
            get { return _rerunDelayMS; }
            set
            {
                if (value <= 1000)
                    value = 1000;

                if (value != _rerunDelayMS)
                {
                    _rerunDelayMS = value;

                    if (_rerunCallbackId != null)
                        _rerunCallbackId = SensusServiceHelper.Get().RescheduleRepeatingCallback(_rerunCallbackId, _rerunDelayMS, _rerunDelayMS, RERUN_CALLBACK_LAG);
                }
            }
        }

        [EntryIntegerUiProperty("Maximum Age (Mins.):", true, 7)]
        public int MaximumAgeMinutes
        {
            get { return _maximumAgeMinutes; }
            set { _maximumAgeMinutes = value; }
        }

        public int NumScriptsAgedOut
        {
            get
            {
                return _numScriptsAgedOut;
            }
            set
            {
                _numScriptsAgedOut = value;
            }
        }

        [EntryStringUiProperty("Random Windows:", true, 8)]
        public string RandomTriggerWindows
        {
            get
            {
                if (_randomTriggerWindows.Count == 0)
                    return "";
                else
                    return string.Concat(_randomTriggerWindows.Select((window, index) => (index == 0 ? "" : ", ") +
                            (
                                window.Item1 == window.Item2 ? window.Item1.Hour + ":" + window.Item1.Minute.ToString().PadLeft(2, '0') :
                                window.Item1.Hour + ":" + window.Item1.Minute.ToString().PadLeft(2, '0') + "-" + window.Item2.Hour + ":" + window.Item2.Minute.ToString().PadLeft(2, '0')
                            )));
            }
            set
            {
                if (value == RandomTriggerWindows)
                    return;

                _randomTriggerWindows.Clear();

                try
                {
                    foreach (string window in value.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries))
                    {
                        string[] startEnd = window.Trim().Split('-');

                        DateTime start = DateTime.Parse(startEnd[0].Trim());
                        DateTime end = start;

                        if (startEnd.Length > 1)
                        {
                            end = DateTime.Parse(startEnd[1].Trim());

                            if (start > end)
                                throw new Exception();
                        }

                        _randomTriggerWindows.Add(new Tuple<DateTime, DateTime>(start, end));
                    }
                }
                catch (Exception)
                {
                }

                // sort windows by increasing hour and minute of the window start (day, month, and year are irrelevant)
                _randomTriggerWindows.Sort((window1, window2) =>
                    {
                        int hourComparison = window1.Item1.Hour.CompareTo(window2.Item1.Hour);

                        if (hourComparison != 0)
                            return hourComparison;
                        else
                            return window1.Item1.Minute.CompareTo(window2.Item1.Minute);
                    });

                if (_probe != null && _probe.Running && _enabled && _randomTriggerWindows.Count > 0)  // probe can be null during deserialization if this property is set first
                    StartRandomTriggerCallbacksAsync();
                else if (SensusServiceHelper.Get() != null)  // service helper can be null when deserializing
                    StopRandomTriggerCallbackAsync();
            }
        }

        public List<DateTime> RunTimes
        {
            get
            {
                return _runTimes;
            }
            set
            {
                _runTimes = value;
            }
        }

        public List<DateTime> CompletionTimes
        {
            get
            {
                return _completionTimes;
            }
            set
            {
                _completionTimes = value;
            }
        }

        [OnOffUiProperty("One Shot:", true, 10)]
        public bool OneShot
        {
            get
            {
                return _oneShot;
            }
            set
            {
                _oneShot = value;
            }
        }

        [OnOffUiProperty("Run On Start:", true, 11)]
        public bool RunOnStart
        {
            get
            {
                return _runOnStart;
            }
            set
            {
                _runOnStart = value;
            }
        }

        [OnOffUiProperty("Display Progress:", true, 13)]
        public bool DisplayProgress
        {
            get
            {
                return _displayProgress;
            }
            set
            {
                _displayProgress = value;
            }
        }

        #endregion

        /// <summary>
        /// For JSON.NET deserialization.
        /// </summary>
        private ScriptRunner()
        {
            _script = new Script();
            _enabled = false;
            _allowCancel = true;
            _triggers = new ObservableCollection<Trigger>();
            _triggerHandler = new Dictionary<Trigger, EventHandler<Tuple<Datum, Datum>>>();
            _invalidScripts = new Queue<Script>();
            _rerunInvalidScripts = false;
            _rerunCallbackId = null;
            _rerunDelayMS = 60000;
            _maximumAgeMinutes = 10;
            _numScriptsAgedOut = 0;
            _randomTriggerWindows = new List<Tuple<DateTime, DateTime>>();
            _randomTriggerCallbackId = null;
            _random = new Random();
            _runTimes = new List<DateTime>();
            _completionTimes = new List<DateTime>();
            _oneShot = false;
            _runOnStart = false;
            _displayProgress = true;

            _triggers.CollectionChanged += (o, e) =>
            {
                if (e.Action == NotifyCollectionChangedAction.Add)
                {
                    foreach (Trigger trigger in e.NewItems)
                    {
                        // ignore duplicate triggers -- the user should delete and re-add them instead.
                        if (_triggerHandler.ContainsKey(trigger))
                            return;

                        // create a handler to be called each time the triggering probe stores a datum
                        EventHandler<Tuple<Datum, Datum>> handler = (oo, previousCurrentDatum) =>
                        {
                            // must be running and must have a current datum
                            lock (_locker)
                            {
                                if (!_probe.Running || !_enabled || previousCurrentDatum.Item2 == null)
                                {
                                    trigger.FireCriteriaMetOnPreviousCall = false;  // this covers the case when the current datum is null. for some probes, the null datum is meaningful and is emitted in order for their state to be tracked appropriately (e.g., POI probe).
                                    return;
                                }
                            }

                            Datum previousDatum = previousCurrentDatum.Item1;
                            Datum currentDatum = previousCurrentDatum.Item2;

                            // get the value that might trigger the script -- it might be null in the case where the property is nullable and is not set (e.g., facebook fields, input locations, etc.)
                            object currentDatumValue = trigger.DatumProperty.GetValue(currentDatum);
                            if (currentDatumValue == null)
                                return;

                            // if we're triggering based on datum value changes/differences instead of absolute values, calculate the change now.
                            if (trigger.Change)
                            {
                                // don't need to set ConditionSatisfiedLastTime = false here, since it cannot be the case that it's true and prevDatum == null (we must have had a currDatum last time in order to set ConditionSatisfiedLastTime = true).
                                if (previousDatum == null)
                                    return;

                                try
                                {
                                    currentDatumValue = Convert.ToDouble(currentDatumValue) - Convert.ToDouble(trigger.DatumProperty.GetValue(previousDatum));
                                }
                                catch (Exception ex)
                                {
                                    SensusServiceHelper.Get().Logger.Log("Trigger error:  Failed to convert datum values to doubles for change calculation:  " + ex.Message, LoggingLevel.Normal, GetType());
                                    return;
                                }
                            }

                            // if the trigger fires for the current value, run a copy of the script so that we can retain a pristine version of the original. use
                            // the async version of run to ensure that we are not on the UI thread.
                            if (trigger.FireFor(currentDatumValue))
                                RunAsync(_script.Copy(), previousDatum, currentDatum);
                        };

                        trigger.Probe.MostRecentDatumChanged += handler;

                        _triggerHandler.Add(trigger, handler);
                    }
                }
                else if (e.Action == NotifyCollectionChangedAction.Remove)
                    foreach (Trigger trigger in e.OldItems)
                        if (_triggerHandler.ContainsKey(trigger))
                        {
                            trigger.Probe.MostRecentDatumChanged -= _triggerHandler[trigger];

                            _triggerHandler.Remove(trigger);
                        }
            };
        }

        public ScriptRunner(string name, ScriptProbe probe)
            : this()
        {
            _name = name;
            _probe = probe;
        }

        public void Initialize()
        {
            foreach (Trigger trigger in _triggers)
                trigger.Reset();
        }

        public void Start()
        {
            if (_rerunInvalidScripts)
                StartRerunCallbacksAsync();

            if (_randomTriggerWindows.Count > 0)
                StartRandomTriggerCallbacksAsync();

            // use the async version below for a couple reasons. first, we're in a non-async method and we want to ensure
            // that the script won't be running on the UI thread. second, from the caller's perspective the prompt should 
            // not need to finish running in order for the runner to be considered started.
            if (_runOnStart)
                RunAsync(_script.Copy());
        }

        private void StartRerunCallbacksAsync()
        {
            new Thread(() =>
                {
                    lock (_invalidScripts)
                    {
                        StopRerunCallbacks();

                        SensusServiceHelper.Get().Logger.Log("Starting rerun callbacks.", LoggingLevel.Normal, GetType());

                        ScheduledCallback callback = new ScheduledCallback((callbackId, cancellationToken, letDeviceSleepCallback) =>
                            {
                                return Task.Run(() =>
                                    {
                                        if (_probe.Running && _enabled && _rerunInvalidScripts)
                                        {
                                            Script scriptToRerun = null;
                                            lock (_invalidScripts)
                                                while (scriptToRerun == null && _invalidScripts.Count > 0)
                                                {
                                                    scriptToRerun = _invalidScripts.Dequeue();
                                                    if (scriptToRerun.Age.TotalMinutes > _maximumAgeMinutes)
                                                    {
                                                        SensusServiceHelper.Get().Logger.Log("Script \"" + _name + "\" has aged out.", LoggingLevel.Normal, GetType());
                                                        scriptToRerun = null;
                                                        ++_numScriptsAgedOut;
                                                    }
                                                }

                                            // we don't need to copy the script, since we're already working with a copy of the original. also, when the script prompts 
                                            // are displayed let the caller know that it's okay to let the device sleep.
                                            if (scriptToRerun != null)
                                                Run(scriptToRerun, postDisplayCallback: letDeviceSleepCallback);
                                        }
                                    });

                            }, "Rerun Script", null); // no user notification message, since there might not be any scripts to rerun

                        _rerunCallbackId = SensusServiceHelper.Get().ScheduleRepeatingCallback(callback, _rerunDelayMS, _rerunDelayMS, RERUN_CALLBACK_LAG);
                    }

                }).Start();
        }

        private void StartRandomTriggerCallbacksAsync()
        {
            new Thread(() =>
                {
                    StartRandomTriggerCallbacks();

                }).Start();
        }

        private void StartRandomTriggerCallbacks()
        {
            lock (_locker)
            {
                if (_randomTriggerWindows.Count == 0)
                    return;

                StopRandomTriggerCallbacks();

                SensusServiceHelper.Get().Logger.Log("Starting random script trigger callbacks.", LoggingLevel.Normal, GetType());

#if __IOS__
                string userNotificationMessage = "Please open to provide input.";
#elif __ANDROID__
                string userNotificationMessage = null;
#elif WINDOWS_PHONE
                string userNotificationMessage = null; // TODO:  Should we use a message?
#else
#error "Unrecognized platform."
#endif

                // find next future trigger window, ignoring month, day, and year of windows. the windows are already sorted.
                DateTime triggerWindowStart = default(DateTime);
                DateTime triggerWindowEnd = default(DateTime);
                DateTime now = DateTime.Now;
                bool foundTriggerWindow = false;
                foreach (Tuple<DateTime, DateTime> randomTriggerWindow in _randomTriggerWindows)
                {
                    if (randomTriggerWindow.Item1.Hour > now.Hour || (randomTriggerWindow.Item1.Hour == now.Hour && randomTriggerWindow.Item1.Minute > now.Minute))
                    {
                        triggerWindowStart = new DateTime(now.Year, now.Month, now.Day, randomTriggerWindow.Item1.Hour, randomTriggerWindow.Item1.Minute, 0);
                        triggerWindowEnd = new DateTime(now.Year, now.Month, now.Day, randomTriggerWindow.Item2.Hour, randomTriggerWindow.Item2.Minute, 0);
                        foundTriggerWindow = true;
                        break;
                    }
                }

                // if there were no future trigger windows, skip to the next day and use the first trigger window
                if (!foundTriggerWindow)
                {
                    Tuple<DateTime, DateTime> firstRandomTriggerWindow = _randomTriggerWindows.First();
                    triggerWindowStart = new DateTime(now.Year, now.Month, now.Day, firstRandomTriggerWindow.Item1.Hour, firstRandomTriggerWindow.Item1.Minute, 0).AddDays(1);
                    triggerWindowEnd = new DateTime(now.Year, now.Month, now.Day, firstRandomTriggerWindow.Item2.Hour, firstRandomTriggerWindow.Item2.Minute, 0).AddDays(1);
                }

                // schedule callback for random offset into trigger window
                DateTime triggerTime = triggerWindowStart.AddSeconds(_random.NextDouble() * (triggerWindowEnd - triggerWindowStart).TotalSeconds);
                int triggerDelayMS = (int)(triggerTime - now).TotalMilliseconds;

                ScheduledCallback callback = new ScheduledCallback((callbackId, cancellationToken, letDeviceSleepCallback) =>
                    {
                        return Task.Run(() =>
                            {
                                // if the probe is still running and the runner is enabled, run a copy of the script so that we can retain a pristine version of the original.
                                // also, when the script prompts display let the caller know that it's okay for the device to sleep.
                                if (_probe.Running && _enabled)
                                {
                                    Run(_script.Copy(), postDisplayCallback: letDeviceSleepCallback);

                                    // establish the next random trigger callback
                                    StartRandomTriggerCallbacks();
                                }
                            });

                    }, "Trigger Randomly", null, userNotificationMessage);

                _randomTriggerCallbackId = SensusServiceHelper.Get().ScheduleOneTimeCallback(callback, triggerDelayMS);
            }
        }

        private void RunAsync(Script script, Datum previousDatum = null, Datum currentDatum = null, Action callback = null)
        {
            new Thread(() =>
                {
                    Run(script, previousDatum, currentDatum);

                    if (callback != null)
                        callback();

                }).Start();
        }

        /// <summary>
        /// Run the specified script. Will block the caller's thread while waiting for input, so be sure not to call this from the UI thread.
        /// </summary>
        /// <param name="script">Script.</param>
        /// <param name="previousDatum">Previous datum.</param>
        /// <param name="currentDatum">Current datum.</param>
        /// <param name="postDisplayCallback">Called when it is okay for the device to sleep.</param>
        private void Run(Script script, Datum previousDatum = null, Datum currentDatum = null, Action postDisplayCallback = null)
        {
            if (script.PresentationTimestamp == null)
                script.PresentationTimestamp = DateTimeOffset.UtcNow;

            bool isRerun = script.FirstRunTimestamp.HasValue;

            lock (_runTimes)
            {
                if (_oneShot)
                {
                    // run one-shot only if the script runner has never been run, or if it has been run but this is a rerun -- the latter will only happen if the first-run script is being rerun.
                    bool runOneShot = _runTimes.Count == 0 || isRerun;

                    if (!runOneShot)
                    {
                        SensusServiceHelper.Get().Logger.Log("Not running one-shot script multiple times.", LoggingLevel.Normal, GetType());
                        return;
                    }
                }

                // submit a separate datum indicating the running of the script. this differs from the script's presentation time because the user
                // might choose to never submit script responses. in this case, there will be no script data or presentation times. the separate
                // datum submitted here will always be submitted upon first run of the script.
                if (!isRerun)
                {
                    Task.Run(async () =>
                    {
                        DateTimeOffset runTime = DateTimeOffset.UtcNow;

                        // geotag the script-run datum if any of the input groups are also geotagged. if none of the groups are geotagged, then
                        // it wouldn't make sense to gather location data from a user privacy perspective.
                        double? latitude = null;
                        double? longitude = null;
                        DateTimeOffset? locationTimestamp = null;
                        if (script.InputGroups.Any(inputGroup => inputGroup.Geotag))
                        {
                            try
                            {
                                Position currentPosition = GpsReceiver.Get().GetReading(default(CancellationToken));

                                if (currentPosition == null)
                                    throw new Exception("GPS receiver returned null position.");

                                latitude = currentPosition.Latitude;
                                longitude = currentPosition.Longitude;
                                locationTimestamp = currentPosition.Timestamp;
                            }
                            catch (Exception ex)
                            {
                                SensusServiceHelper.Get().Logger.Log("Failed to get position for script-run datum:  " + ex.Message, LoggingLevel.Normal, GetType());
                            }
                        }

                        await _probe.StoreDatumAsync(new ScriptRunDatum(runTime, _script.Id, _name, script.Id, script.CurrentDatum == null ? null : script.CurrentDatum.Id, latitude, longitude, locationTimestamp), default(CancellationToken));
                    });

                    // add run time and remove all run times before the participation horizon
                    _runTimes.Add(DateTime.Now);
                    _runTimes.RemoveAll(runTime => runTime < _probe.Protocol.ParticipationHorizon);
                }
            }

            SensusServiceHelper.Get().Logger.Log("Running \"" + _name + "\".", LoggingLevel.Normal, GetType());

            // this method can be called with previous / current datum values (e.g., when the script is first triggered). it 
            // can also be called without previous / current datum values (e.g., when triggering randomly or rerunning). if
            // we have such values, set them on the script.

            if (previousDatum != null)
                script.PreviousDatum = previousDatum;

            if (currentDatum != null)
                script.CurrentDatum = currentDatum;

            ManualResetEvent inputWait = new ManualResetEvent(false);

            // we would like to support input timeouts in the following prompt. however, this causes problems on ios for any prompts that are run in response to
            // a scheduled callback (e.g., random window or rerun). this is because all scheduled callbacks are run as background tasks within ios to ensure
            // completion (or cancellation) within a reasonable amount of time. if the app is deactivated and the prompt callback is canceled because it runs out
            // of background time, the callback may be rescheduled which will require use of the UI thread submitting the new UILocalNotification. ios will not
            // permit this.
            SensusServiceHelper.Get().PromptForInputsAsync(script.FirstRunTimestamp, script.InputGroups, null, _allowCancel, null, "You will not receive credit for your responses if you cancel. Do you want to cancel?", "You have not completed all required fields. You will not receive credit for your responses if you continue. Do you want to continue?", "Are you ready to submit your responses?", _displayProgress, postDisplayCallback, async inputGroups =>
                {
                    bool canceled = inputGroups == null;

                    // process all inputs in the script
                    foreach (InputGroup inputGroup in script.InputGroups)
                        foreach (Input input in inputGroup.Inputs)
                        {
                            // only consider inputs that still need to be stored. if an input has already been stored, it should be ignored.
                            if (input.NeedsToBeStored)
                            {
                                // if the user canceled the prompts, reset the input. we reset here within the above if-check because if an
                                // input has already been stored we should not reset it. its value and read-only status are fixed for all 
                                // time, even if the prompts are later redisplayed by the invalid script handler.
                                if (canceled)
                                    input.Reset();
                                else if (input.Valid && input.Display)  // store all inputs that are valid and displayed. some might be valid from previous responses but not displayed because the user navigated back through the survey and changed a previous response that caused a subsesequently displayed input to be hidden via display contingencies.
                                {
                                    // the _script.Id allows us to link the data to the script that the user created. it never changes. on the other hand, the script
                                    // that is passed into this method is always a copy of the user-created script. the script.Id allows us to link the various data
                                    // collected from the user into a single logical response. each run of the script has its own script.Id so that responses can be
                                    // grouped across runs. this is the difference between scriptId and runId in the following line.
                                    await _probe.StoreDatumAsync(new ScriptDatum(input.CompletionTimestamp.GetValueOrDefault(DateTimeOffset.UtcNow), _script.Id, _name, input.GroupId, input.Id, script.Id, input.Value, script.CurrentDatum == null ? null : script.CurrentDatum.Id, input.Latitude, input.Longitude, script.PresentationTimestamp.GetValueOrDefault(), input.LocationUpdateTimestamp, input.CompletionRecords), default(CancellationToken));

                                    // once inputs are stored, they should not be stored again, nor should the user be able to modify them if the script is rerun.
                                    input.NeedsToBeStored = false;
                                    Xamarin.Forms.Device.BeginInvokeOnMainThread(() => input.Enabled = false);
                                }
                            }
                        }

                    inputWait.Set();
                });

            inputWait.WaitOne();

            // if this is the first run, set the timestamp.
            if (!isRerun)
                script.FirstRunTimestamp = DateTimeOffset.UtcNow;

            SensusServiceHelper.Get().Logger.Log("\"" + _name + "\" has finished running.", LoggingLevel.Normal, typeof(Script));

            if (script.Valid)
            {
                // add completion time and remove all completion times before the participation horizon
                lock (_completionTimes)
                {
                    _completionTimes.Add(DateTime.Now);
                    _completionTimes.RemoveAll(completionTime => completionTime < _probe.Protocol.ParticipationHorizon);
                }
            }
            else if (_rerunInvalidScripts)
                lock (_invalidScripts)
                    _invalidScripts.Enqueue(script);
        }

        public bool TestHealth(ref string error, ref string warning, ref string misc)
        {
            bool restart = false;

            lock (_invalidScripts)
                if (_invalidScripts.Count > 0)
                    misc += "Script runner \"" + _name + "\" is holding " + _invalidScripts.Count + " copies, the oldest being run first on " + _invalidScripts.Select(s => s.FirstRunTimestamp).Min() + "." + Environment.NewLine;

            if (_numScriptsAgedOut > 0)
                misc += _numScriptsAgedOut + " \"" + _name + "\" scripts have aged out." + Environment.NewLine;

            return restart;
        }

        public void ClearForSharing()
        {
            _invalidScripts.Clear();
            _numScriptsAgedOut = 0;
            _runTimes.Clear();
            _completionTimes.Clear();
            _rerunCallbackId = null;
            _randomTriggerCallbackId = null;
        }

        public void Restart()
        {
            Stop();
            Start();
        }

        private void StopRerunCallbacksAsync()
        {
            new Thread(() =>
                {
                    StopRerunCallbacks();

                }).Start();
        }

        private void StopRerunCallbacks()
        {
            SensusServiceHelper.Get().Logger.Log("Stopping rerun callbacks.", LoggingLevel.Normal, GetType());
            SensusServiceHelper.Get().UnscheduleCallback(_rerunCallbackId);
            _rerunCallbackId = null;
        }

        private void StopRandomTriggerCallbackAsync()
        {
            new Thread(() =>
                {
                    StopRandomTriggerCallbacks();

                }).Start();
        }

        private void StopRandomTriggerCallbacks()
        {
            SensusServiceHelper.Get().Logger.Log("Stopping random trigger callbacks.", LoggingLevel.Normal, GetType());
            SensusServiceHelper.Get().UnscheduleCallback(_randomTriggerCallbackId);
            _randomTriggerCallbackId = null;
        }

        public void Stop()
        {
            StopRerunCallbacks();
            StopRandomTriggerCallbacks();
        }
    }
}