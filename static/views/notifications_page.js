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
import utils from 'utils';
import models from 'models';
import {ShowNodeInfoDialog} from 'views/dialogs';
import {backboneMixin} from 'component_mixins';

var NotificationsPage, Notification;

NotificationsPage = React.createClass({
  mixins: [backboneMixin('notifications')],
  statics: {
    title: i18n('notifications_page.title'),
    navbarActiveElement: null,
    breadcrumbsPath: [['home', '#'], 'notifications'],
    fetchData() {
      var notifications = app.notifications;
      return notifications.fetch().then(() =>
        ({notifications: notifications})
      );
    }
  },
  checkDateIsToday(date) {
    var today = new Date();
    var day = _.padLeft(today.getDate(), 2, '0');
    var month = _.padLeft(today.getMonth() + 1, 2, '0');
    return [day, month, today.getFullYear()].join('-') === date;
  },
  render() {
    var notificationGroups = this.props.notifications.groupBy('date');
    return (
      <div className='notifications-page'>
        <div className='page-title'>
          <h1 className='title'>{i18n('notifications_page.title')}</h1>
        </div>
        <div className='content-box'>
          {_.map(notificationGroups, (notifications, date) => {
            return (
              <div className='row notification-group' key={date}>
                <div className='title col-xs-12'>
                  {this.checkDateIsToday(date) ? i18n('notifications_page.today') : date}
                </div>
                {_.map(notifications, (notification) => {
                  return <Notification
                    key={notification.id}
                    notification={notification}
                  />;
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
});

Notification = React.createClass({
  mixins: [backboneMixin('notification')],
  showNodeInfo(id) {
    var node = new models.Node({id: id});
    node.fetch();
    ShowNodeInfoDialog.show({node: node});
  },
  markAsRead() {
    var notification = this.props.notification;
    notification.toJSON = () => notification.pick('id', 'status');
    notification.save({status: 'read'});
  },
  onNotificationClick() {
    if (this.props.notification.get('status') === 'unread') {
      this.markAsRead();
    }
    var nodeId = this.props.notification.get('node_id');
    if (nodeId) {
      this.showNodeInfo(nodeId);
    }
  },
  render() {
    var topic = this.props.notification.get('topic');
    var notificationClasses = {
      'col-xs-12 notification': true,
      'text-danger': topic === 'error',
      'text-warning': topic === 'warning',
      unread: this.props.notification.get('status') === 'unread'
    };
    var iconClass = {
      error: 'glyphicon-exclamation-sign',
      warning: 'glyphicon-warning-sign',
      discover: 'glyphicon-bell'
    }[topic] || 'glyphicon-info-sign';
    return (
      <div className={utils.classNames(notificationClasses)} onClick={this.onNotificationClick}>
        <div className='notification-time'>{this.props.notification.get('time')}</div>
        <div className='notification-type'><i className={'glyphicon ' + iconClass} /></div>
        <div className='notification-message'>
          <span
            className={this.props.notification.get('node_id') && 'btn btn-link'}
            dangerouslySetInnerHTML={{
              __html: utils.urlify(this.props.notification.escape('message'))
            }}
          />
        </div>
      </div>
    );
  }
});

export default NotificationsPage;
