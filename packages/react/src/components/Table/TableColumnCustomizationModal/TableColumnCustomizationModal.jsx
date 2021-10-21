import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import merge from 'lodash/merge';
import uniqBy from 'lodash/uniqBy';
import cloneDeep from 'lodash/cloneDeep';
import { CloseOutline16 } from '@carbon/icons-react';
import warning from 'warning';

import ComposedModal from '../../ComposedModal/ComposedModal';
import { settings } from '../../../constants/Settings';
import { OverridePropTypes } from '../../../constants/SharedPropTypes';
import ListBuilder from '../../ListBuilder/ListBuilder';
import { EditingStyle } from '../../../utils/DragAndDropUtils';

import { useVisibilityToggle } from './visibilityToggleHook';

const { iotPrefix } = settings;

const propTypes = {
  /** Defines the groups and which columns they contain. The order of the groups is relevant. */
  groupMapping: PropTypes.arrayOf(
    PropTypes.shape({
      /** The id of the column group */
      id: PropTypes.string.isRequired,
      /** The name of the column group */
      name: PropTypes.string.isRequired,
      /** The ids of the columns belonging to the group. The order is irrelevant. */
      columnIds: PropTypes.arrayOf(PropTypes.string),
    })
  ),
  /** If true selected columns can be hidden/shown  */
  hasVisibilityToggle: PropTypes.bool,
  /** If true shows a "Load more" button at the end of the list of available columns */
  hasLoadMore: PropTypes.bool,
  i18n: PropTypes.shape({
    availableColumnsEmptyText: PropTypes.string,
    availableColumnsLabel: PropTypes.string,
    cancelButtonLabel: PropTypes.string,
    clearSearchIconDescription: PropTypes.string,
    closeIconDescription: PropTypes.string,
    collapseIconDescription: PropTypes.string,
    expandIconDescription: PropTypes.string,
    hideIconDescription: PropTypes.string,
    loadMoreButtonLabel: PropTypes.string,
    modalTitle: PropTypes.string,
    modalBody: PropTypes.string,
    removeIconDescription: PropTypes.string,
    resetButtonLabel: PropTypes.string,
    saveButtonLabel: PropTypes.string,
    searchPlaceholder: PropTypes.string,
    selectedColumnsEmptyText: PropTypes.string,
    selectedColumnsLabel: PropTypes.string,
    showIconDescription: PropTypes.string,
  }),
  /** Array of objects representing the order and visibility of the columns */
  initialOrdering: PropTypes.arrayOf(
    PropTypes.shape({
      /** The id of the column */
      columnId: PropTypes.string.isRequired,
      /* Visibility of column in table, defaults to false */
      isHidden: PropTypes.bool,
    })
  ).isRequired,
  /** The list of all the selectable columns  */
  availableColumns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  /** RowIds for rows currently loading more available columns */
  loadingMoreIds: PropTypes.arrayOf(PropTypes.string),
  /** Called when columns are selected, deselected, hidden, shown and reordered */
  onChange: PropTypes.func,
  /** Called with the id of the last item when the load more button is clicked */
  onLoadMore: PropTypes.func,
  /** Called on cancel button click and on the top right close icon click */
  onClose: PropTypes.func.isRequired,
  /** Called with the updated ordering and columns array when save button is clicked */
  onSave: PropTypes.func.isRequired,
  /** Called when the reset button is clicked */
  onReset: PropTypes.func,

  /** Determines if the modal is open or closed (i.e. visible or not to the user) */
  open: PropTypes.bool.isRequired,
  /** Allows overriding the two main components using the attributes 'composedModal and 'listBuilder' */
  overrides: PropTypes.shape({
    composedModal: OverridePropTypes,
    listBuilder: OverridePropTypes,
  }),
  /** The id of a column that is pinned as the first column and cannot be deselected */
  pinnedColumnId: PropTypes.string,
  /** Id that can be used for testing */
  testId: PropTypes.string,
};

const defaultProps = {
  groupMapping: [],
  hasLoadMore: false,
  hasVisibilityToggle: false,
  i18n: {
    availableColumnsEmptyText: 'No available columns to show',
    availableColumnsLabel: 'Available columns',
    cancelButtonLabel: 'Cancel',
    clearSearchIconDescription: 'Clear search input',
    closeIconDescription: 'Close',
    collapseIconDescription: 'Collapse',
    expandIconDescription: 'Expand',
    hideIconDescription: 'Column is visible, click to hide.',
    loadMoreButtonLabel: 'Load more...',
    modalTitle: 'Customize columns',
    modalBody:
      'Select the available columns to be displayed on the table. Drag the selected columns to reorder them.',
    removeIconDescription: 'Remove from list',
    resetButtonLabel: 'Reset',
    saveButtonLabel: 'Save',
    searchPlaceholder: 'Search',
    selectedColumnsEmptyText: 'No columns selected',
    selectedColumnsLabel: 'Selected columns',
    showIconDescription: 'Column is hidden, click to show.',
  },
  loadingMoreIds: [],
  onChange: () => {},
  onLoadMore: () => {},
  onReset: () => {},
  overrides: undefined,
  pinnedColumnId: undefined,
  testId: 'table-column-customization-modal',
};

const removeItemFromGroup = (items, groupItem, id) => {
  const modifiedGroupItem = {
    ...groupItem,
    children: groupItem.children.filter((item) => item.id !== id),
  };
  return items.map((item) => (item.id === groupItem.id ? modifiedGroupItem : item));
};

const handleRemoveWithinGroup = (previous, groupId, id) => {
  const groupItem = previous.find((item) => item.id === groupId);
  const removeGroup = groupItem?.children.length === 1;

  return removeGroup
    ? previous.filter((item) => item.id !== groupId)
    : removeItemFromGroup(previous, groupItem, id);
};

const createGroupItem = (id, name, children) => ({
  id,
  isCategory: true,
  content: {
    value: name,
  },
  children,
});

const findAndCloneColumnItem = (id, availableColumnItems) => {
  const column = availableColumnItems.find((item) => item.id === id);
  if (column === undefined && __DEV__) {
    warning(
      false,
      `Can't find column with id '${id}'. Make sure all columns referenced in prop 'initialOrdering' also exists in  prop 'availableColumns'.`
    );
  }
  return column ? cloneDeep(column) : undefined;
};

const transformToAvailableItems = (availableColumns, pinnedColumnId, hasLoadMore) => {
  const availableItems = availableColumns.map((column) => ({
    id: column.id,
    content: { value: column.name },
    disabled: pinnedColumnId === column.id,
  }));
  if (hasLoadMore) {
    availableItems[availableItems.length - 1].hasLoadMore = true;
  }
  return availableItems;
};

const transformToSelectedGroupItem = (initialOrdering, availableColumnItems, group) => {
  const columns = group.columnIds
    // Only select children that are in the initial ordering
    .filter((childId) => initialOrdering.find((column) => column.columnId === childId))
    // Sort the children according to the initialOrdering
    .sort(
      (a, b) =>
        initialOrdering.findIndex((ord) => ord.columnId === a) -
        initialOrdering.findIndex((ord) => ord.columnId === b)
    )
    .map((childId) => findAndCloneColumnItem(childId, availableColumnItems))
    .filter((column) => column !== undefined);
  return createGroupItem(group.id, group.name, columns);
};

const transformToSelectedItems = (initialOrdering, availableColumnItems, groupMapping) => {
  const orderedSelectedColumnItems = initialOrdering
    .map(({ columnId }) => {
      const group = groupMapping.find((groupDef) => groupDef.columnIds.includes(columnId));
      return group
        ? transformToSelectedGroupItem(initialOrdering, availableColumnItems, group)
        : findAndCloneColumnItem(columnId, availableColumnItems);
    })
    .filter((column) => (column?.children ? column?.children.length : column));

  return orderedSelectedColumnItems.length
    ? uniqBy(orderedSelectedColumnItems, (item) => item.id)
    : [];
};

const preventDropInOtherGroup = (...args) => args[2] !== 'nested';

const TableColumnCustomizationModal = ({
  groupMapping,
  hasLoadMore,
  hasVisibilityToggle,
  i18n,
  initialOrdering,
  availableColumns,
  loadingMoreIds,
  onChange,
  onClose,
  onLoadMore,
  onReset,
  onSave: onSaveCallback,
  open,
  overrides,
  pinnedColumnId,
  testId,
}) => {
  const {
    availableColumnsEmptyText,
    availableColumnsLabel,
    cancelButtonLabel,
    clearSearchIconDescription,
    closeIconDescription,
    collapseIconDescription,
    expandIconDescription,
    loadMoreButtonLabel,
    modalTitle,
    modalBody,
    removeIconDescription,
    resetButtonLabel,
    saveButtonLabel,
    searchPlaceholder,
    selectedColumnsEmptyText,
    selectedColumnsLabel,
    hideIconDescription,
    showIconDescription,
  } = merge({}, defaultProps.i18n, i18n);
  const nrOfItemsNotNeedingSearch = 12;

  const availableColumnItems = useMemo(
    () => transformToAvailableItems(availableColumns, pinnedColumnId, hasLoadMore),
    [availableColumns, pinnedColumnId, hasLoadMore]
  );

  const [searchValue, setSearchValue] = useState(null);
  const [hiddenIds, setHiddenIds] = useState(
    initialOrdering.filter((col) => col.isHidden).map((col) => col.columnId)
  );
  const [selectedColumnItems, setSelectedColumnItems] = useState(() => {
    return transformToSelectedItems(initialOrdering, availableColumnItems, groupMapping);
  });

  const onSave = () => {
    // Column group mapping is not exported as part of save
    // since static group structures are supported but the modifications of
    // groups is currently not.
    const updatedOrdering = selectedColumnItems
      .flatMap((item) => (item.isCategory ? item.children.map(({ id }) => id) : item.id))
      .map((id) => ({ columnId: id, isHidden: hiddenIds.includes(id) }));
    const updatedColumns = updatedOrdering.map(({ columnId }) =>
      availableColumns.find(({ id }) => id === columnId)
    );
    onSaveCallback(updatedOrdering, updatedColumns);
  };

  const handleRemove = useCallback(
    (event, id) => {
      setSelectedColumnItems((previous) => {
        const group = groupMapping.find((selectionGroup) => selectionGroup.columnIds.includes(id));
        return group
          ? handleRemoveWithinGroup(previous, group.id, id)
          : previous.filter((item) => item.id !== id);
      });
      onChange('deselect', id);
    },
    [groupMapping, onChange]
  );

  const handleLoadMore = (id) => {
    onLoadMore(id);
  };

  const selectedItems = useVisibilityToggle({
    handleRemove,
    hasVisibilityToggle,
    hiddenIds,
    hideIconDescription,
    onChange,
    removeIconDescription,
    selectedColumnItems,
    setHiddenIds,
    showIconDescription,
    testId,
  }).map((item) => {
    return item.id === pinnedColumnId
      ? { ...item, disabled: false, content: { ...item.content, rowActions: () => {} } }
      : item;
  });

  const handleAdd = (event, id) => {
    setSelectedColumnItems((prev) => {
      const newItem = cloneDeep(availableColumnItems.find((item) => item.id === id));
      const group = groupMapping.find((selectionGroup) => selectionGroup.columnIds.includes(id));
      const previousGroupItem = group && prev.find((item) => item.id === group.id);
      const unmodifiedItems = prev.filter((item) => item.id !== group?.id);
      delete newItem.hasLoadMore;

      const itemToAdd =
        group && !previousGroupItem
          ? {
              id: group.id,
              isCategory: true,
              content: {
                value: group.name,
              },
              children: [newItem],
            }
          : group && previousGroupItem
          ? { ...previousGroupItem, children: [...previousGroupItem.children, newItem] }
          : newItem;

      return [...unmodifiedItems, itemToAdd];
    });
    onChange('select', id);
  };

  const i18nFooter = {
    primaryButtonLabel: saveButtonLabel,
    secondaryButtonLabel: cancelButtonLabel,
  };

  const MyComposedModal = overrides?.composedModal?.component || ComposedModal;
  const MyListBuilder = overrides?.listBuilder?.component || ListBuilder;

  return (
    <MyComposedModal
      footer={{
        ...i18nFooter,
      }}
      iconDescription={closeIconDescription}
      testId={testId}
      header={{
        // label is needed since it generates the aria-label,
        // but we hide the actual label element using css
        label: modalTitle,
        title: modalTitle,
        helpText: modalBody,
      }}
      onClose={onClose}
      onSubmit={onSave}
      open={open}
      className={`${iotPrefix}--column-customization-modal`}
      {...overrides?.composedModal?.props}
    >
      <MyListBuilder
        testId={`${testId}-list-builder`}
        getAllowedDropIds={
          groupMapping.length
            ? (dragId) => {
                const topLevelItemIsDragged = selectedItems.find(({ id }) => id === dragId);
                return topLevelItemIsDragged
                  ? selectedItems.map(({ id }) => id)
                  : selectedItems
                      .find((item) => item.children?.find(({ id }) => dragId === id))
                      ?.children.map(({ id }) => id);
              }
            : null
        }
        handleLoadMore={handleLoadMore}
        hasItemsSearch={availableColumnItems.length > nrOfItemsNotNeedingSearch}
        hasSelectedItemsSearch={false}
        hasReset
        i18n={{
          allListEmptyText: availableColumnsEmptyText,
          allListSearchPlaceholderText: searchPlaceholder,
          allListTitle: () => availableColumnsLabel,
          clearSearchIconDescription,
          collapseIconDescription,
          expandIconDescription,
          loadMoreButtonLabel,
          removeIconDescription,
          resetLabel: resetButtonLabel,
          selectedListTitle: () => selectedColumnsLabel,
          selectedListEmptyText: selectedColumnsEmptyText,
        }}
        items={availableColumnItems}
        itemWillMove={preventDropInOtherGroup}
        itemsSearchValue={searchValue}
        loadingMoreIds={loadingMoreIds}
        lockedIds={[pinnedColumnId]}
        onAdd={handleAdd}
        onSelectedListReordered={(reorderedSelected) => {
          setSelectedColumnItems(reorderedSelected);
          onChange(
            reorderedSelected.flatMap((item) =>
              item.isCategory ? item.children.map(({ id }) => id) : item.id
            )
          );
        }}
        // Called when available items checkboxes are unchecked. The selected items
        // have their own remove callbacks in their actions.
        onRemove={handleRemove}
        onReset={onReset}
        onItemsSearchChange={(value) => {
          setSearchValue(value);
        }}
        removeIcon={CloseOutline16}
        selectedItems={selectedItems}
        selectedDefaultExpandedIds={selectedItems
          .filter((item) => item.isCategory)
          .map(({ id }) => id)}
        selectedEditingStyle={EditingStyle.Single}
        useCheckboxes
        {...overrides?.listBuilder?.props}
      />
    </MyComposedModal>
  );
};

TableColumnCustomizationModal.propTypes = propTypes;
TableColumnCustomizationModal.defaultProps = defaultProps;
export default TableColumnCustomizationModal;
