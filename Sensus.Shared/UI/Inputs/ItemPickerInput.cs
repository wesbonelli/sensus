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
using Sensus.Shared.UI.UiProperties;

namespace Sensus.Shared.UI.Inputs
{
    public abstract class ItemPickerInput : Input
    {
        private bool _randomizeItemOrder;

        [OnOffUiProperty("Randomize Item Order:", true, 12)]
        public bool RandomizeItemOrder
        {
            get
            {
                return _randomizeItemOrder;
            }
            set
            {
                _randomizeItemOrder = value;
            }
        }

        public ItemPickerInput()
        {
            Construct();
        }

        public ItemPickerInput(string labelText)
            : base(labelText)
        {
            Construct();
        }

        public ItemPickerInput(string name, string labelText)
            : base(name, labelText)
        {
            Construct();
        }

        private void Construct()
        {
            _randomizeItemOrder = false;
        }
    }
}