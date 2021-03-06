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

/*
 * Copyright (с) 2014 Stephen J. Collings, Matthew Honnibal, Pieter Vanderwerff
 *
 * Based on https://github.com/react-bootstrap/react-bootstrap/blob/master/src/Input.jsx
**/

import $ from 'jquery';
import _ from 'underscore';
import i18n from 'i18n';
import React from 'react';
import ReactDOM from 'react-dom';
import utils from 'utils';
import {outerClickMixin} from 'component_mixins';

export var Input = React.createClass({
  propTypes: {
    type: React.PropTypes.oneOf([
      'text', 'password', 'textarea', 'checkbox', 'radio',
      'select', 'hidden', 'number', 'range', 'file'
    ]).isRequired,
    name: React.PropTypes.node,
    label: React.PropTypes.node,
    debounce: React.PropTypes.bool,
    description: React.PropTypes.node,
    disabled: React.PropTypes.bool,
    inputClassName: React.PropTypes.node,
    wrapperClassName: React.PropTypes.node,
    tooltipPlacement: React.PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    tooltipIcon: React.PropTypes.node,
    tooltipText: React.PropTypes.node,
    toggleable: React.PropTypes.bool,
    onChange: React.PropTypes.func,
    extraContent: React.PropTypes.node
  },
  getInitialState() {
    return {
      visible: false,
      fileName: (this.props.defaultValue || {}).name || null,
      content: (this.props.defaultValue || {}).content || null
    };
  },
  getDefaultProps() {
    return {
      type: 'text',
      tooltipIcon: 'glyphicon-warning-sign',
      tooltipPlacement: 'right'
    };
  },
  togglePassword() {
    this.setState({visible: !this.state.visible});
  },
  isCheckboxOrRadio() {
    return this.props.type === 'radio' || this.props.type === 'checkbox';
  },
  getInputDOMNode() {
    return ReactDOM.findDOMNode(this.refs.input);
  },
  debouncedChange: _.debounce(function() {
    return this.onChange();
  }, 200, {leading: true}),
  pickFile() {
    if (!this.props.disabled) {
      this.getInputDOMNode().click();
    }
  },
  saveFile(fileName, content) {
    this.setState({fileName, content});
    return this.props.onChange(this.props.name, {name: fileName, content});
  },
  removeFile() {
    if (!this.props.disabled) {
      ReactDOM.findDOMNode(this.refs.form).reset();
      this.saveFile(null, null);
    }
  },
  readFile() {
    var reader = new FileReader();
    var input = this.getInputDOMNode();
    if (input.files.length) {
      reader.onload = () => this.saveFile(input.value.replace(/^.*[\\\/]/g, ''), reader.result);
      reader.readAsBinaryString(input.files[0]);
    }
  },
  onChange() {
    var {onChange, name, type} = this.props;
    if (onChange) {
      var input = this.getInputDOMNode();
      return onChange(name, type === 'checkbox' ? input.checked : input.value);
    }
  },
  handleFocus(e) {
    e.target.select();
  },
  renderInput() {
    var {visible, fileName, content} = this.state;
    var {
      type, inputClassName, toggleable, selectOnFocus, debounce, children, disabled, extraContent
    } = this.props;
    var isCheckboxOrRadio = this.isCheckboxOrRadio();
    var inputWrapperClasses = {
      'input-group': toggleable,
      'custom-tumbler': isCheckboxOrRadio,
      hidden: type === 'hidden'
    };

    var props = {
      ref: 'input',
      key: 'input',
      onFocus: selectOnFocus && this.handleFocus,
      type: (toggleable && visible) ? 'text' : type,
      className: utils.classNames({
        'form-control': type !== 'range',
        [inputClassName]: inputClassName
      }),
      onChange: type === 'file' ?
        this.readFile
      :
        debounce ? this.debouncedChange : this.onChange
    };

    var Tag = _.contains(['select', 'textarea'], type) ? type : 'input';
    var input = <Tag {...this.props} {...props}>{children}</Tag>;
    if (type === 'file') input = <form ref='form'>{input}</form>;

    return (
      <div key='input-group' className={utils.classNames(inputWrapperClasses)}>
        {input}
        {type === 'file' &&
          <div className='input-group'>
            <input
              className='form-control file-name'
              type='text'
              placeholder={i18n('controls.file.placeholder')}
              value={fileName && '[' + utils.showSize(content.length) + '] ' + fileName}
              onClick={this.pickFile}
              disabled={disabled}
              readOnly
            />
            <div
              className='input-group-addon'
              onClick={fileName ? this.removeFile : this.pickFile}
            >
              <i
                className={utils.classNames(
                  'glyphicon',
                  fileName && !disabled ? 'glyphicon-remove' : 'glyphicon-file'
                )}
              />
            </div>
          </div>
        }
        {toggleable &&
          <div className='input-group-addon' onClick={this.togglePassword}>
            <i
              className={utils.classNames(
                'glyphicon',
                visible ? 'glyphicon-eye-close' : 'glyphicon-eye-open'
              )}
            />
          </div>
        }
        {isCheckboxOrRadio && <span>&nbsp;</span>}
        {extraContent}
      </div>
    );
  },
  renderLabel(children) {
    var {label, id, tooltipText, tooltipPlacement, tooltipIcon} = this.props;
    if (!label && !children) return null;
    return (
      <label key='label' htmlFor={id}>
        {children}
        {label}
        {tooltipText &&
          <Tooltip text={tooltipText} placement={tooltipPlacement}>
            <i className={utils.classNames('glyphicon tooltip-icon', tooltipIcon)} />
          </Tooltip>
        }
      </label>
    );
  },
  renderDescription() {
    var {error, description} = this.props;
    return (
      <span key='description' className='help-block'>
        {!_.isUndefined(error) && !_.isNull(error) ? error : description || ''}
      </span>
    );
  },
  renderWrapper(children) {
    var {error, disabled, wrapperClassName} = this.props;
    var isCheckboxOrRadio = this.isCheckboxOrRadio();
    var classes = {
      'form-group': !isCheckboxOrRadio,
      'checkbox-group': isCheckboxOrRadio,
      'has-error': !_.isUndefined(error) && !_.isNull(error),
      disabled,
      [wrapperClassName]: wrapperClassName
    };
    return <div className={utils.classNames(classes)}>{children}</div>;
  },
  render() {
    if (this.props.type === 'hidden' && !this.props.description && !this.props.label) return null;
    return this.renderWrapper(
      this.isCheckboxOrRadio() ? [
        this.renderLabel(this.renderInput()),
        this.renderDescription()
      ] : [
        this.renderLabel(),
        this.renderInput(),
        this.renderDescription()
      ]
    );
  }
});

export var RadioGroup = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    values: React.PropTypes.arrayOf(React.PropTypes.object).isRequired,
    label: React.PropTypes.node,
    tooltipText: React.PropTypes.node
  },
  render() {
    var {label, tooltipText, values} = this.props;
    return (
      <div className='radio-group'>
        {label &&
          <h4>
            {label}
            {tooltipText &&
              <Tooltip text={tooltipText} placement='right'>
                <i className='glyphicon glyphicon-warning-sign tooltip-icon' />
              </Tooltip>
            }
          </h4>
        }
        {_.map(values,
          (value) => <Input
            {...this.props}
            {...value}
            type='radio'
            key={value.data}
            value={value.data}
          />
        )}
      </div>
    );
  }
});

export var ProgressBar = React.createClass({
  propTypes: {
    wrapperClassName: React.PropTypes.node,
    progress: React.PropTypes.number
  },
  render() {
    var wrapperClasses = {
      progress: true
    };
    wrapperClasses[this.props.wrapperClassName] = this.props.wrapperClassName;

    var isInfinite = !_.isNumber(this.props.progress);
    var progressClasses = {
      'progress-bar': true,
      'progress-bar-striped active': isInfinite
    };

    return (
      <div className={utils.classNames(wrapperClasses)}>
        <div
          className={utils.classNames(progressClasses)}
          role='progressbar'
          style={{width: isInfinite ? '100%' : _.max([this.props.progress, 3]) + '%'}}
        >
          {!isInfinite && this.props.progress + '%'}
        </div>
      </div>
    );
  }
});

export var Table = React.createClass({
  propTypes: {
    tableClassName: React.PropTypes.node,
    head: React.PropTypes.array,
    body: React.PropTypes.array
  },
  render() {
    var tableClasses = {'table table-bordered': true, 'table-striped': !this.props.noStripes};
    tableClasses[this.props.tableClassName] = this.props.tableClassName;
    return (
      <table className={utils.classNames(tableClasses)}>
        <thead>
          <tr>
            {_.map(this.props.head, (column, index) => {
              var classes = {};
              classes[column.className] = column.className;
              return <th key={index} className={utils.classNames(classes)}>{column.label}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {_.map(this.props.body, (row, rowIndex) => {
            return <tr key={rowIndex}>
              {_.map(row, (column, columnIndex) => {
                return <td key={columnIndex} className='enable-selection'>{column}</td>;
              })}
            </tr>;
          })}
        </tbody>
      </table>
    );
  }
});

export var Popover = React.createClass({
  mixins: [outerClickMixin],
  propTypes: {
    className: React.PropTypes.node,
    placement: React.PropTypes.node
  },
  getDefaultProps() {
    return {placement: 'bottom'};
  },
  render() {
    var classes = {'popover in': true};
    classes[this.props.placement] = true;
    classes[this.props.className] = true;
    return (
      <div className={utils.classNames(classes)}>
        <div className='arrow' />
        <div className='popover-content'>{this.props.children}</div>
      </div>
    );
  }
});

export var Tooltip = React.createClass({
  propTypes: {
    container: React.PropTypes.node,
    placement: React.PropTypes.node,
    text: React.PropTypes.node
  },
  getDefaultProps() {
    return {
      placement: 'top',
      container: 'body',
      wrapperClassName: 'tooltip-wrapper'
    };
  },
  componentDidMount() {
    if (this.props.text) this.addTooltip();
  },
  componentDidUpdate() {
    if (this.props.text) {
      this.updateTooltipTitle();
    } else {
      this.removeTooltip();
    }
  },
  componentWillUnmount() {
    this.removeTooltip();
  },
  addTooltip() {
    $(ReactDOM.findDOMNode(this.refs.tooltip)).tooltip({
      container: this.props.container,
      placement: this.props.placement,
      title: this.props.text
    });
  },
  updateTooltipTitle() {
    $(ReactDOM.findDOMNode(this.refs.tooltip)).attr('title', this.props.text).tooltip('fixTitle');
  },
  removeTooltip() {
    $(ReactDOM.findDOMNode(this.refs.tooltip)).tooltip('destroy');
  },
  render() {
    if (!this.props.wrap) {
      return React.cloneElement(React.Children.only(this.props.children), {ref: 'tooltip'});
    }
    return (
      <div className={this.props.wrapperClassName} ref='tooltip'>
        {this.props.children}
      </div>
    );
  }
});
