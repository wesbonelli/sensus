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

namespace Sensus.Shared.Probes.User.Health
{
    public class BirthdateDatum : Datum
    {
        private DateTimeOffset _birthdate;

        public DateTimeOffset Birthdate
        {
            get
            {
                return _birthdate;
            }
            set
            {
                _birthdate = value;
            }
        }

        public override string DisplayDetail
        {
            get
            {
                return "Birthdate:  " + _birthdate;
            }
        }

        public BirthdateDatum(DateTimeOffset timestamp, DateTimeOffset birthdate)
            : base(timestamp)
        {
            _birthdate = birthdate;
        }

        public override string ToString()
        {
            return base.ToString() + Environment.NewLine +
            "Birth date:  " + _birthdate;
        }
    }
}