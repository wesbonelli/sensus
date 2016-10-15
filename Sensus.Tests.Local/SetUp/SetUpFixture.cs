﻿using NUnit.Framework;
using Sensus.Shared.Context;
using Sensus.Shared.Test.Classes;

namespace Sensus.Shared.Tests //this namespace has to align with the tests we want this fixture for
{
    [SetUpFixture]
    public class SetUpFixture
    {
        [SetUp]
        public void SetUp()
        {
            SensusContext.Current = new TestSensusContext();
        }
    }
}