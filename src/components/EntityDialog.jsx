// components/EntityDialog.jsx
import { cloneElement, Fragment, isValidElement } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Divider } from 'primereact/divider';

export function EntityDialog({ 
  visible, 
  onHide, 
  saving, 
  editingItem,
  formData,
  onFormChange,
  onSave,
  fields = [],
  title = 'Entity'
}) {
  const isEditing = !!editingItem;
  const isFieldMissing = (field) => {
    const value = formData[field.name];
    if (Array.isArray(value)) return value.length === 0;
    return !value;
  };

  const renderField = (field) => {
    if (typeof field.render === 'function') {
      return field.render({
        key: field.name,
        field,
        value: formData[field.name],
        formData,
        saving,
        isEditing,
        editingItem,
        onChange: (value) => onFormChange(field.name, value),
        onFormChange,
      });
    }

    switch (field.type) {
      case 'multiselect':
        return (
          <div key={field.name} className="field">
            <label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <MultiSelect
              id={field.name}
              value={formData[field.name] || []}
              onChange={(e) => onFormChange(field.name, e.value)}
              options={field.options || []}
              optionLabel={field.optionLabel || 'label'}
              optionValue={field.optionValue || 'value'}
              display={field.display || 'chip'}
              placeholder={field.placeholder}
              maxSelectedLabels={field.maxSelectedLabels || 5}
              filter={field.filter ?? true}
              showSelectAll={field.showSelectAll ?? false}
              {...field.inputProps}
            />
            {field.helpText && <small className="text-color-secondary">{field.helpText}</small>}
            {field.required && isFieldMissing(field) && saving && (
              <small className="p-error">{field.label} is required</small>
            )}
          </div>
        );
      
 case 'password':
         return (
          <div key={field.name} className="field">
            <label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <InputText
              id={field.name}
              type="password"
              value={formData[field.name] || ''}
              onChange={(e) => onFormChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              autoFocus={field.autoFocus}
              className={isFieldMissing(field) && saving && field.required ? 'p-invalid' : ''}
              {...field.inputProps}
            />
            {isFieldMissing(field) && saving && field.required && (
              <small className="p-error">{field.label} is required</small>
            )}
          </div>
        );

      case 'text':
      default:
        return (
          <div key={field.name} className="field">
            <label htmlFor={field.name}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <InputText
              id={field.name}
              value={formData[field.name] || ''}
              onChange={(e) => onFormChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              autoFocus={field.autoFocus}
              className={isFieldMissing(field) && saving && field.required ? 'p-invalid' : ''}
              {...field.inputProps}
            />
            {isFieldMissing(field) && saving && field.required && (
              <small className="p-error">{field.label} is required</small>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog
      header={isEditing ? `Edit ${title}` : `Create New ${title}`}
      visible={visible}
      style={{ width: '30rem' }}
      modal
      draggable={false}
      onHide={onHide}
    >
      <div className="flex flex-column gap-3">
        {fields.map((field, index) => {
          const rendered = renderField(field);
          const key = field.name || `field-${index}`;
          if (isValidElement(rendered)) {
            return cloneElement(rendered, { key });
          }
          return <Fragment key={key}>{rendered}</Fragment>;
        })}

        <Divider />

        <div  style={{display:'flex',gap:'0.5rem'}}>
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            outlined 
            onClick={onHide} 
            disabled={saving}
          />
          <Button 
            label={saving ? 'Saving...' : isEditing ? `Update ${title}` : `Create ${title}`}
            icon={saving ? 'pi pi-spin pi-spinner' : isEditing ? 'pi pi-check' : 'pi pi-save'}
            onClick={onSave} 
            loading={saving}
          />
        </div>
      </div>
    </Dialog>
  );
}
