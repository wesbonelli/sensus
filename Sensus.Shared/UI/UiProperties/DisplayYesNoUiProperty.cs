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

using Sensus.Shared.Exceptions;
using System;
using Xamarin.Forms;
using System.Reflection;

namespace Sensus.Shared.UI.UiProperties
{
    /// <summary>
    /// Decorated members should be rendered as display-only yes/no values.
    /// </summary>
    public class DisplayYesNoUiProperty : UiProperty
    {
        public class ValueConverter : IValueConverter
        {
            public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
            {
                if (value == null)
                    return "";
                
                return ((bool)value) ? "Yes" : "No";
            }

            public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
            {
                SensusException.Report("Invalid call to " + GetType().FullName + ".ConvertBack.");
                return null;
            }
        }

        public DisplayYesNoUiProperty(string labelText, int order)
            : base(labelText, true, order)
        {
        }

        public override View GetView(PropertyInfo property, object o, out BindableProperty targetProperty, out IValueConverter converter)
        {
            targetProperty = Label.TextProperty;
            converter = new ValueConverter();

            return new Label();
        }
    }
}
