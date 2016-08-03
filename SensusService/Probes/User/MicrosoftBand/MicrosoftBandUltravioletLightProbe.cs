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
using Microsoft.Band.Portable;
using Microsoft.Band.Portable.Sensors;
using Syncfusion.SfChart.XForms;

namespace SensusService.Probes.User.MicrosoftBand
{
    public class MicrosoftBandUltravioletLightProbe : MicrosoftBandProbe<BandUltravioletLightSensor, BandUltravioletLightReading>
    {
        public override Type DatumType
        {
            get
            {
                return typeof(MicrosoftBandUltravioletLightDatum);
            }
        }

        public override string DisplayName
        {
            get
            {
                return "Microsoft Band UV Light";
            }
        }

        protected override BandUltravioletLightSensor GetSensor(BandClient bandClient)
        {
            return bandClient.SensorManager.UltravioletLight;
        }

        protected override Datum GetDatumFromReading(BandUltravioletLightReading reading)
        {
            return new MicrosoftBandUltravioletLightDatum(DateTimeOffset.UtcNow, reading.Level);
        }

        protected override ChartSeries GetChartSeries()
        {
            return null;
        }

        protected override ChartDataPoint GetChartDataPointFromDatum(Datum datum)
        {
            return null;
        }

        protected override RangeAxisBase GetChartSecondaryAxis()
        {
            return null;
        }
    }
}