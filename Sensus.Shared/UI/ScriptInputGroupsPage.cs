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

using Xamarin.Forms;
using Sensus.Shared.UI.Inputs;
using Sensus.Shared.Probes.User.Scripts;
using System.Linq;
using System.Collections.Generic;

namespace Sensus.Shared.UI
{
    public class ScriptInputGroupsPage : ContentPage
    {
        private Script _script;
        private ListView _groupsList;

        public ScriptInputGroupsPage(Script script)
        {
            _script = script;

            Title = "Input Groups";

            _groupsList = new ListView();
            _groupsList.ItemTemplate = new DataTemplate(typeof(TextCell));
            _groupsList.ItemTemplate.SetBinding(TextCell.TextProperty, new Binding(".", stringFormat: "{0}"));
            _groupsList.ItemTapped += async (o, e) =>
            {
                if (_groupsList.SelectedItem == null)
                    return;

                InputGroup selectedInputGroup = _groupsList.SelectedItem as InputGroup;
                int selectedIndex = script.InputGroups.IndexOf(selectedInputGroup);

                List<string> actions = new string[] { "Edit", "Copy", "Delete" }.ToList();

                if (selectedIndex < script.InputGroups.Count - 1)
                    actions.Insert(0, "Move Down");

                if (selectedIndex > 0)
                    actions.Insert(0, "Move Up");

                string selectedAction = await DisplayActionSheet(selectedInputGroup.Name, "Cancel", null, actions.ToArray());

                if (selectedAction == "Move Up")
                    script.InputGroups.Move(selectedIndex, selectedIndex - 1);
                else if (selectedAction == "Move Down")
                    script.InputGroups.Move(selectedIndex, selectedIndex + 1);
                else if (selectedAction == "Edit")
                {
                    List<InputGroup> previousInputGroups = _script.InputGroups.Where((inputGroup, index) => index < selectedIndex).ToList();
                    ScriptInputGroupPage inputGroupPage = new ScriptInputGroupPage(selectedInputGroup, previousInputGroups);
                    inputGroupPage.Disappearing += (oo, ee) =>
                    {
                        Bind();
                    };

                    await Navigation.PushAsync(inputGroupPage);

                    _groupsList.SelectedItem = null;
                }
                else if (selectedAction == "Copy")
                    script.InputGroups.Add(new InputGroup(selectedInputGroup));
                else if (selectedAction == "Delete")
                {
                    if (await DisplayAlert("Delete " + selectedInputGroup.Name + "?", "This action cannot be undone.", "Delete", "Cancel"))
                    {
                        _script.InputGroups.Remove(selectedInputGroup);
                        _groupsList.SelectedItem = null;  // manually reset, since it isn't done automatically.
                    }
                }
            };

            ToolbarItems.Add(new ToolbarItem(null, "plus.png", () => { _script.InputGroups.Add(new InputGroup { Name = "New Input Group" }); }));

            Bind();
            Content = _groupsList;
        }

        public void Bind()
        {
            _groupsList.ItemsSource = null;
            _groupsList.ItemsSource = _script.InputGroups;
        }
    }
}