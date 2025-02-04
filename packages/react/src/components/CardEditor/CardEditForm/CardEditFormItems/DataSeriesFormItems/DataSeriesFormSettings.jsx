import React from 'react';
import PropTypes from 'prop-types';

import { settings } from '../../../../../constants/Settings';
import { TextInput } from '../../../../TextInput';
import { Toggle } from '../../../../Toggle';

const { iotPrefix } = settings;

const propTypes = {
  /** card data value */
  cardConfig: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    size: PropTypes.string,
    type: PropTypes.string,
    content: PropTypes.shape({
      series: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string,
          dataSourceId: PropTypes.string,
          color: PropTypes.string,
        })
      ),
      decimalPrecision: PropTypes.number,
      xLabel: PropTypes.string,
      yLabel: PropTypes.string,
      unit: PropTypes.string,
      includeZeroOnXaxis: PropTypes.bool,
      includeZeroOnYaxis: PropTypes.bool,
      timeDataSourceId: PropTypes.string,
      showLegend: PropTypes.bool,
    }),
    interval: PropTypes.string,
  }),
  /** Callback function when form data changes */
  onChange: PropTypes.func.isRequired,
  i18n: PropTypes.shape({
    xAxisLabel: PropTypes.string,
    yAxisLabel: PropTypes.string,
    unitLabel: PropTypes.string,
    decimalPrecisionLabel: PropTypes.string,
  }),
};

const defaultProps = {
  cardConfig: {},
  i18n: {
    xAxisLabel: 'X-axis label',
    yAxisLabel: 'Y-axis label',
    includeZeroOnXaxis: 'Include zero on x-axis',
    includeZeroOnYaxis: 'Include zero on y-axis',
    unitLabel: 'Unit',
    decimalPrecisionLabel: 'Decimal precision',
  },
};

const DataSeriesFormSettings = ({ cardConfig, onChange, i18n }) => {
  const mergedI18n = { ...defaultProps.i18n, ...i18n };
  const { content, id } = cardConfig;

  const baseClassName = `${iotPrefix}--card-edit-form`;

  return (
    <>
      <div className={`${baseClassName}--input`}>
        <TextInput
          id={`${id}_title`}
          labelText={mergedI18n.xAxisLabel}
          light
          onChange={(evt) =>
            onChange({
              ...cardConfig,
              content: { ...cardConfig.content, xLabel: evt.target.value },
            })
          }
          value={content?.xLabel}
        />
      </div>
      <div className={`${baseClassName}--input`}>
        <TextInput
          id={`${id}_y-axis-label`}
          labelText={mergedI18n.yAxisLabel}
          light
          onChange={(evt) =>
            onChange({
              ...cardConfig,
              content: { ...cardConfig.content, yLabel: evt.target.value },
            })
          }
          value={content?.yLabel}
        />
      </div>
      <div className={`${baseClassName}--input`}>
        <TextInput
          id={`${id}_unit-selection`}
          labelText={mergedI18n.unitLabel}
          light
          onChange={(evt) =>
            onChange({
              ...cardConfig,
              content: { ...cardConfig.content, unit: evt.target.value },
            })
          }
          value={content?.unit}
        />
      </div>
      <div className={`${baseClassName}--input`}>
        <TextInput
          id={`${id}_decimal-precision`}
          labelText={mergedI18n.decimalPrecisionLabel}
          light
          onChange={(evt) =>
            onChange({
              ...cardConfig,
              content: {
                ...cardConfig.content,
                decimalPrecision: evt.target.value,
              },
            })
          }
          value={content?.decimalPrecision}
        />
      </div>
      <div className={`${baseClassName}--input--toggle-field ${baseClassName}--input`}>
        <span>{mergedI18n.includeZeroOnXaxis}</span>
        <Toggle
          size="sm"
          data-testid="includeZeroOnXaxis-toggle"
          id="includeZeroOnXaxis-toggle"
          aria-label={mergedI18n.includeZeroOnXaxis}
          labelA=""
          labelB=""
          toggled={cardConfig.content?.includeZeroOnXaxis}
          onToggle={(bool) =>
            onChange({
              ...cardConfig,
              content: { ...cardConfig.content, includeZeroOnXaxis: bool },
            })
          }
        />
      </div>
      <div className={`${baseClassName}--input--toggle-field ${baseClassName}--input`}>
        <span>{mergedI18n.includeZeroOnYaxis}</span>
        <Toggle
          size="sm"
          data-testid="includeZeroOnYaxis-toggle"
          id="includeZeroOnYaxis-toggle"
          aria-label={mergedI18n.includeZeroOnYaxis}
          labelA=""
          labelB=""
          toggled={cardConfig.content?.includeZeroOnYaxis}
          onToggle={(bool) =>
            onChange({
              ...cardConfig,
              content: { ...cardConfig.content, includeZeroOnYaxis: bool },
            })
          }
        />
      </div>
    </>
  );
};

DataSeriesFormSettings.propTypes = propTypes;
DataSeriesFormSettings.defaultProps = defaultProps;

export default DataSeriesFormSettings;
