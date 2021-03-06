/*
 * Copyright 2014 Mirantis, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
**/
import _ from 'underscore';
import i18n from 'i18n';
import React from 'react';
import models from 'models';
import utils from 'utils';
import {Input} from 'views/controls';

export default {
  propTypes: {
    settings: React.PropTypes.object.isRequired
  },
  getDefaultProps() {
    return {renderableStatisticsFields: ['send_anonymous_statistic', 'user_choice_saved']};
  },
  getInitialState() {
    return {
      initialSettings: _.cloneDeep(this.props.settings.attributes),
      actionInProgress: false
    };
  },
  getStatisticsSettingsToSave() {
    // we need to save just renderableStatisticsFields
    var data = _.cloneDeep(this.state.initialSettings);
    _.each(this.props.renderableStatisticsFields, (settingName) => {
      data.statistics[settingName].value = this.props.settings.get(
        utils.makePath('statistics', settingName, 'value')
      );
    });
    return data;
  },
  saveSettings(data) {
    return (new models.FuelSettings(data)).save(null, {patch: true, validate: false});
  },
  checkRestrictions(name, action = 'disable') {
    return this.props.settings.checkRestrictions(
      this.configModels,
      action,
      this.props.settings.get('statistics').name
    );
  },
  componentWillMount() {
    this.configModels = {
      fuel_settings: this.props.settings,
      version: app.version,
      default: this.props.settings
    };
  },
  renderInput(settingName, wrapperClassName, disabledState) {
    var path = utils.makePath('statistics', settingName);
    var setting = this.props.settings.get(path);
    if (
      this.checkRestrictions('metadata', 'hide').result ||
      this.checkRestrictions(settingName, 'hide').result ||
      setting.type === 'hidden'
    ) return null;

    var error = (this.props.settings.validationError || {})[path];
    var disabled = this.checkRestrictions('metadata').result ||
      this.checkRestrictions(settingName).result ||
      disabledState;

    return <Input
      key={settingName}
      type={setting.type}
      name={settingName}
      label={setting.label && i18n(setting.label)}
      checked={!disabled && setting.value}
      value={setting.value}
      disabled={disabled}
      inputClassName={setting.type === 'text' && 'input-xlarge'}
      wrapperClassName={wrapperClassName}
      onChange={this.onCheckboxChange}
      error={error && i18n(error)}
    />;
  },
  renderList(list, key) {
    return (
      <div key={key}>
        {i18n('statistics.' + key + '_title')}
        <ul>
          {_.map(list, (item) => {
            return <li key={item}>{i18n('statistics.' + key + '.' + item)}</li>;
          })}
        </ul>
      </div>
    );
  },
  renderIntro() {
    var ns = 'statistics.';
    var lists = {
      actions: [
        'operation_type',
        'operation_time',
        'actual_time',
        'network_verification',
        'ostf_results'
      ],
      settings: [
        'envronments_amount',
        'distribution',
        'network_type',
        'kernel_parameters',
        'admin_network_parameters',
        'pxe_parameters',
        'dns_parameters',
        'storage_options',
        'related_projects',
        'modified_settings',
        'networking_configuration'
      ],
      node_settings: [
        'deployed_nodes_amount',
        'deployed_roles',
        'disk_layout',
        'interfaces_configuration'
      ],
      system_info: [
        'hypervisor',
        'hardware_info',
        'fuel_version',
        'openstack_version'
      ]
    };
    return (
      <div>
        <div className='statistics-text-box'>
          <div>
            {i18n(ns + 'help_to_improve')}
          </div>
          <button
            className='btn-link'
            data-toggle='collapse'
            data-target='.statistics-disclaimer-box'
          >
            {i18n(ns + 'learn_whats_collected')}
          </button>
          <div className='collapse statistics-disclaimer-box'>
            <p>{i18n(ns + 'statistics_includes_full')}</p>
            {_.map(lists, this.renderList)}
            <p>{i18n(ns + 'statistics_user_info')}</p>
          </div>
        </div>
      </div>
    );
  },
  onCheckboxChange(settingName, value) {
    this.props.settings.set(utils.makePath('statistics', settingName, 'value'), value);
  }
};
