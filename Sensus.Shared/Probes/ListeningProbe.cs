// Copyright 2014 The Rector & Visitors of the University of Virginia
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

using Sensus.Shared.UI.UiProperties;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace Sensus.Shared.Probes
{
    public abstract class ListeningProbe : Probe
    {
        private float _maxDataStoresPerSecond;
        private bool _keepDeviceAwake;
        private bool _deviceAwake;

        private readonly object _locker = new object();

        [EntryFloatUiProperty("Max Data / Second:", true, int.MaxValue)]
        public float MaxDataStoresPerSecond
        {
            get { return _maxDataStoresPerSecond; }
            set { _maxDataStoresPerSecond = value; }
        }

        [OnOffUiProperty("Keep Device Awake:", true, int.MaxValue - 1)]
        public bool KeepDeviceAwake
        {
            get
            {
                return _keepDeviceAwake;
            }
            set
            {
                // warn the user about this setting if it's being changed
                if (value != _keepDeviceAwake && SensusServiceHelper.Get() != null)
                {
                    TimeSpan duration = TimeSpan.FromSeconds(6);

                    if (value && !string.IsNullOrWhiteSpace(DeviceAwakeWarning))
                        SensusServiceHelper.Get().FlashNotificationAsync(DeviceAwakeWarning, false, duration);
                    else if (!value && !string.IsNullOrWhiteSpace(DeviceAsleepWarning))
                        SensusServiceHelper.Get().FlashNotificationAsync(DeviceAsleepWarning, false, duration);
                }

                _keepDeviceAwake = value;
            }
        }

        [JsonIgnore]
        protected abstract bool DefaultKeepDeviceAwake { get; }

        [JsonIgnore]
        protected abstract string DeviceAwakeWarning { get; }

        [JsonIgnore]
        protected abstract string DeviceAsleepWarning { get; }

        protected override float RawParticipation
        {
            get
            {
#if __ANDROID__
                // compute participation using successful health test times of the probe
                long dayMS = 60000 * 60 * 24;
                long participationHorizonMS = Protocol.ParticipationHorizonDays * dayMS;
                float fullParticipationHealthTests = participationHorizonMS / (float)SensusServiceHelper.HEALTH_TEST_DELAY_MS;

                // lock collection because it might be concurrently modified by the test health method running in another thread.
                lock (SuccessfulHealthTestTimes)
                    return SuccessfulHealthTestTimes.Count(healthTestTime => healthTestTime >= Protocol.ParticipationHorizon) / fullParticipationHealthTests;
#elif __IOS__
                // on ios, we cannot rely on the health test times to tell us how long the probe has been running. this is
                // because, unlike in android, ios does not let local notifications return to the app when the app is in the 
                // background. instead, the ios user must open a notification or directly open the app in order for the health 
                // test to run. so the best we can do is keep track of when the probe was started and stopped and compute participation 
                // based on how much of the participation horizon has been covered by the probe. it is possible that the probe 
                // is in this running state but is somehow faulty and failing the health tests. thus, the approach is not 
                // perfect, but it's the best we can do on ios.
                double runningSeconds;

                lock (StartStopTimes)
                {
                    if (StartStopTimes.Count == 0)
                        return 0;
                    
                    runningSeconds = StartStopTimes.Select((startStopTime, index) =>
                        {
                            DateTime? startTime = null;
                            DateTime? stopTime = null;

                            // if this is the final element and it's a start time, then the probe is currently running and we should calculate 
                            // how much time has elapsed since the probe was started.
                            if (index == StartStopTimes.Count - 1 && startStopTime.Item1)
                            {
                                // if the current start time came before the participation horizon, use the horizon as the start time.
                                if (startStopTime.Item2 < Protocol.ParticipationHorizon)
                                    startTime = Protocol.ParticipationHorizon;
                                else
                                    startTime = startStopTime.Item2;

                                // the probe is currently running, so use the current time as the stop time.
                                stopTime = DateTime.Now;
                            }
                            // otherwise, we only need to consider stop times after the participation horizon.
                            else if (!startStopTime.Item1 && startStopTime.Item2 > Protocol.ParticipationHorizon)
                            {
                                stopTime = startStopTime.Item2;

                                // if the previous element is a start time, use it.
                                if (index > 0 && StartStopTimes[index - 1].Item1)
                                    startTime = StartStopTimes[index - 1].Item2;

                                // if we don't have a previous element that's a start time, or we do but the start time was before the participation horizon, then 
                                // use the participation horizon as the start time.
                                if (startTime == null || startTime.Value < Protocol.ParticipationHorizon)
                                    startTime = Protocol.ParticipationHorizon;
                            }

                            // if we've got a start and stop time, return the total number of seconds covered.
                            if (startTime != null && stopTime != null)
                                return (stopTime.Value - startTime.Value).TotalSeconds;
                            else
                                return 0;
                        
                        }).Sum();
                }

                double participationHorizonSeconds = TimeSpan.FromDays(Protocol.ParticipationHorizonDays).TotalSeconds;
                return (float)(runningSeconds / participationHorizonSeconds);
#else
#warning "Unrecognized platform"
                return 0;
#endif
            }
        }

        public override string CollectionDescription
        {
            get
            {
                return DisplayName + ":  When it changes.";
            }
        }

        protected ListeningProbe()
        {
            _maxDataStoresPerSecond = 1;
            _keepDeviceAwake = DefaultKeepDeviceAwake;
            _deviceAwake = false;
        }

        protected sealed override void InternalStart()
        {
            lock (_locker)
            {
                // only keep device awake if we're not already running. calls to LetDeviceSleep must match these exactly.
                if (!Running && _keepDeviceAwake)
                {
                    SensusServiceHelper.Get().KeepDeviceAwake();
                    _deviceAwake = true;
                }

                base.InternalStart();

                StartListening();
            }
        }

        protected abstract void StartListening();

        public sealed override void Stop()
        {
            lock (_locker)
            {
                base.Stop();

                StopListening();

                if (_deviceAwake)
                {
                    SensusServiceHelper.Get().LetDeviceSleep();
                    _deviceAwake = false;
                }
            }
        }

        protected abstract void StopListening();

        public sealed override Task StoreDatumAsync(Datum datum, CancellationToken cancellationToken = default(CancellationToken))
        {
            float storesPerSecond = 1 / (float)(DateTimeOffset.UtcNow - MostRecentStoreTimestamp).TotalSeconds;
            if (storesPerSecond <= _maxDataStoresPerSecond)
                return base.StoreDatumAsync(datum, cancellationToken);
            else
                return Task.FromResult(false);
        }

        public override void Reset()
        {
            base.Reset();

            _deviceAwake = false;
        }
    }
}
