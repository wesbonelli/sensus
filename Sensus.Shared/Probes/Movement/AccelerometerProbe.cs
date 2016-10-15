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

using System;
using System.Threading;
using Newtonsoft.Json;
using Syncfusion.SfChart.XForms;

namespace Sensus.Shared.Probes.Movement
{
    /// <summary>
    /// Probes information about physical acceleration in x, y, and z directions.
    /// </summary>
    public abstract class AccelerometerProbe : ListeningProbe
    {
        private bool _stabilizing;

        protected bool Stabilizing
        {
            get { return _stabilizing; }
        }

        [JsonIgnore]
        protected override bool DefaultKeepDeviceAwake
        {
            get
            {
                return true;
            }
        }

        [JsonIgnore]
        protected override string DeviceAwakeWarning
        {
            get
            {
                return "This setting does not affect iOS. Android devices will use additional power to report all updates.";
            }
        }

        [JsonIgnore]
        protected override string DeviceAsleepWarning
        {
            get
            {
                return "This setting does not affect iOS. Android devices will sleep and pause updates.";
            }
        }

        public sealed override string DisplayName
        {
            get { return "Acceleration"; }
        }

        public sealed override Type DatumType
        {
            get { return typeof(AccelerometerDatum); }
        }

        protected override void Initialize()
        {
            base.Initialize();

            _stabilizing = true;
        }

        protected override void StartListening()
        {
            // allow the accelerometer to stabilize...the first few readings can be extremely erratic
            new Thread(() =>
                {
                    Thread.Sleep(2000);
                    _stabilizing = false;

                    // not sure if null is the problem:  https://insights.xamarin.com/app/Sensus-Production/issues/907
                    if (SensusServiceHelper.Get() != null)
                        SensusServiceHelper.Get().Logger.Log("Accelerometer has finished stabilization period.", LoggingLevel.Normal, GetType());

                }).Start();
        }

        public override void Reset()
        {
            base.Reset();

            _stabilizing = false;
        }

        protected override ChartSeries GetChartSeries()
        {
            return null;
        }

        protected override ChartDataPoint GetChartDataPointFromDatum(Datum datum)
        {
            return null;
        }

        protected override ChartAxis GetChartPrimaryAxis()
        {
            throw new NotImplementedException();
        }

        protected override RangeAxisBase GetChartSecondaryAxis()
        {
            throw new NotImplementedException();
        }
    }
}