// components/EntityTable.jsx
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FormTable from './datatable/FormTable';
import { EntityDialog } from './EntityDialog';

const TOAST_LIFE = 3000;

// components/EntityTable.jsx
export function EntityTable({
  useHook,
  columns,
  dialogFields,
  renderDialog,  // prop جديد
  entityName,
  onBeforeDelete,
  onAfterDelete,
  onBeforeSave,
  onAfterSave,
  globalFilterFields,
  rowActions,
  showEditAction = true,
  showDeleteAction = true,
  actionsHeader = null,
  actionsColumnStyle = { width: '9rem' },
  selected,
  onSelectedChange,
  selectionMode = null,
  selectionKey,
  rowClassName,
  leftToolbarExtras,
  rightToolbarExtras,
  frozenActions = false,
}) {
  const { t } = useTranslation();
  const hook = useHook();
  const {
    items,
    loading,
    saving,
    error,
    filters,
    globalFilterValue,
    showDialog,
    editingItem,
    formData,
    footer,
    loadItems,
    deleteItem,
    createItem,
    updateItem,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    updateFormData,
    onGlobalFilterChange,
    clearFilters,
  } = hook;

  const resolvedDialogFields = typeof dialogFields === 'function'
    ? dialogFields(hook)
    : (dialogFields || []);

  const resolvedGlobalFilterFields = globalFilterFields
    || columns
      .map((col) => col.filterField || col.field)
      .filter(Boolean);
  const resolvedRowActions = useMemo(() =>
    typeof rowActions === 'function'
      ? rowActions(hook)
      : (rowActions || []),
  [rowActions, hook]);
  const resolvedActionsHeader = actionsHeader || t('entityTable.actions');
  const hasActionsColumn = showEditAction || showDeleteAction || resolvedRowActions.length > 0;
  const resolvedLeftToolbarExtras = typeof leftToolbarExtras === 'function' ? leftToolbarExtras(hook) : leftToolbarExtras;
  const resolvedRightToolbarExtras = typeof rightToolbarExtras === 'function' ? rightToolbarExtras(hook) : rightToolbarExtras;
  const localizedEntityName = t(`entities.${entityName}`, { defaultValue: entityName });

  const toast = useRef(null);

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: TOAST_LIFE });
  }, []);

  const handleDelete = useCallback((item) => {
    confirmDialog({
      message: t('entityTable.confirmDeleteMessage', { entity: localizedEntityName, name: item.nom }),
      header: t('entityTable.confirmDeleteTitle'),
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        if (onBeforeDelete) {
          const canDelete = await onBeforeDelete(item);
          if (canDelete === false) return;
        }

        const result = await deleteItem(item.id);

        if (result.ok) {
          showToast('success', t('entityTable.deleted'), t('entityTable.deletedSuccess', { entity: localizedEntityName }));
          onAfterDelete?.(item);
        } else {
          showToast('error', t('entityTable.deleteFailed'), result.error || t('entityTable.couldNotDelete', { entity: localizedEntityName }));
        }
      },
    });
  }, [deleteItem, localizedEntityName, onAfterDelete, onBeforeDelete, showToast, t]);

  const handleSave = useCallback(async () => {
    if (onBeforeSave) {
      const canSave = await onBeforeSave(formData, editingItem);
      if (canSave === false) return;
    }

    let result;
    if (editingItem) {
      result = await updateItem(editingItem.id, formData);
    } else {
      result = await createItem(formData);
    }

    if (result.ok) {
      showToast(
        'success',
        editingItem ? t('entityTable.updated') : t('entityTable.created'),
        editingItem
          ? t('entityTable.updatedSuccess', { entity: localizedEntityName })
          : t('entityTable.createdSuccess', { entity: localizedEntityName })
      );
      onAfterSave?.(result.data, editingItem);
      closeDialog();
    } else {
      showToast('error', t('entityTable.saveFailed'), result.error || t('entityTable.couldNotSave', { entity: localizedEntityName }));
    }
  }, [closeDialog, createItem, editingItem, localizedEntityName, formData, onAfterSave, onBeforeSave, showToast, t, updateItem]);

  const actionsTemplate = useCallback((rowData) => (
    <div className="entity-table-actions">
      {showEditAction && (
        <Button
          type="button"
          icon="pi pi-pencil"
          onClick={() => openEditDialog(rowData)}
          text
          rounded
          tooltip={t('entityTable.edit')}
        />
      )}
      {showDeleteAction && (
        <Button
          type="button"
          icon="pi pi-trash"
          severity="danger"
          onClick={() => handleDelete(rowData)}
          text
          rounded
          tooltip={t('entityTable.delete')}
        />
      )}
      {resolvedRowActions.map((action, index) => {
        const isVisible = typeof action.visible === 'function' ? action.visible(rowData) : action.visible !== false;
        if (!isVisible) return null;

        const isDisabled = typeof action.disabled === 'function' ? action.disabled(rowData) : !!action.disabled;

        return (
          <Button
            key={action.key || `${action.label || action.icon || 'action'}-${index}`}
            type="button"
            icon={action.icon}
            label={action.label}
            severity={action.severity}
            outlined={action.outlined}
            text={action.text ?? true}
            rounded={action.rounded ?? true}
            tooltip={action.tooltip || action.label}
            disabled={isDisabled}
            onClick={() => action.onClick?.(rowData)}
          />
        );
      })}
    </div>
  ), [handleDelete, openEditDialog, resolvedRowActions, showDeleteAction, showEditAction, t]);

  const leftToolbarTemplate = () => (
    <div className="entity-toolbar-group">
      <Button
        type="button"
        severity="secondary"
        icon="pi pi-refresh"
        outlined
        onClick={loadItems}
      />
      <Button
        type="button"
        severity="success"
        icon="pi pi-plus"
        label={t(`entityTable.add.${entityName}`, { defaultValue: t('entityTable.addGeneric', { entity: localizedEntityName }) })}
        onClick={openCreateDialog}
      />
      {resolvedLeftToolbarExtras}
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="entity-toolbar-group entity-toolbar-group-right">
      <IconField iconPosition="left">
        <InputIcon className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder={t(`entityTable.search.${entityName}`, { defaultValue: t('entityTable.searchGeneric', { entity: localizedEntityName }) })}
        />
      </IconField>
      <Button
        type="button"
        severity="contrast"
        icon="pi pi-filter-slash"
        outlined
        onClick={clearFilters}
        tooltip={t('entityTable.clearFilters')}
      />
      {resolvedRightToolbarExtras}
    </div>
  );

  return (
    <FormTable loading={loading} error={error} onRetry={loadItems}>
      <Card className="entity-card">
        <Toast ref={toast} position="top-right" />
        <ConfirmDialog />

        {/* استخدم renderDialog إذا وجد، وإلا استخدم EntityDialog الافتراضي */}
        {renderDialog ? (
          renderDialog({
            visible: showDialog,
            onHide: closeDialog,
            saving,
            editingItem,
            formData,
            onFormChange: updateFormData,
            onSave: handleSave,
            title: entityName,
            hook,
          })
        ) : (
          <EntityDialog
            visible={showDialog}
            onHide={closeDialog}
            saving={saving}
            editingItem={editingItem}
            formData={formData}
            onFormChange={updateFormData}
            onSave={handleSave}
            fields={resolvedDialogFields}
            title={entityName}
          />
        )}

        <Toolbar left={leftToolbarTemplate} right={rightToolbarTemplate} className="mb-3" />

        <DataTable
          key={`dt-${selectionKey ?? 0}`}
          className="entity-data-table"
          paginator
          rows={200}
          rowsPerPageOptions={[10, 200, 400]}
          value={items}
          loading={loading}
          dataKey="id"
          filters={filters}
          globalFilterFields={resolvedGlobalFilterFields}
          sortField="id"
          sortOrder={-1}
          showGridlines
          removableSort
          selectionMode={selectionMode === 'multiple' ? 'checkbox' : selectionMode}
          footer={footer}
          selection={selected}
          onSelectionChange={(e) => onSelectedChange?.(e.value)}
          rowClassName={rowClassName}
          emptyMessage={t(`entityTable.empty.${entityName}`, { defaultValue: t('entityTable.emptyGeneric', { entity: localizedEntityName }) })}
          scrollable
          scrollHeight="calc(100vh - 22rem)"
          size="small"
          frozenWidth={frozenActions ? '11rem' : undefined}
        >
          {selectionMode && (
            <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} style={{ width: '3rem' }} />
          )}
          {columns.map((col, index) => (
            <Column
              key={col.field || index}
              field={col.field}
              filterField={col.filterField}
              header={col.header}
              body={col.body}
              sortable={col.sortable}
              filter={col.filter}
              filterPlaceholder={col.filterPlaceholder ?? t('entityTable.searchDefault')}
              showFilterMenu={col.filtermenu ?? false}

              style={col.style}

            />
          ))}
          {hasActionsColumn && (
            <Column
              header={resolvedActionsHeader}
              body={actionsTemplate}
              style={actionsColumnStyle}
              frozen={frozenActions}
              alignFrozen="right"
            />
          )}
        </DataTable>
      </Card>
    </FormTable>
  );
}
