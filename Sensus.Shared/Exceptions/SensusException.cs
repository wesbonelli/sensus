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
using Xamarin;

namespace Sensus.Shared.Exceptions
{
    public class SensusException : Exception
    {
        public static void Report(string message, Exception innerException = null, bool throwException = false)
        {
            SensusException exception = new SensusException(message, innerException);

            if (throwException)
                throw exception;
        }

        public SensusException(string message, Exception innerException = null)
            : base(message, innerException)
        {
            SensusServiceHelper.Get().Logger.Log("Exception being created:  " + message + Environment.NewLine + "Stack:  " + Environment.StackTrace, LoggingLevel.Normal, GetType());

            try
            {
                Insights.Report(this, "Stack Trace", Environment.StackTrace, Insights.Severity.Error);
            }
            catch (Exception ex)
            {
                SensusServiceHelper.Get().Logger.Log("Failed to report new exception to Xamarin Insights:  " + ex.Message, LoggingLevel.Normal, GetType());
            }
        }
    }
}