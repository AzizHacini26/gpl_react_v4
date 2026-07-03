// pages/Users.jsx
import { EntityTable } from '../components/EntityTable';
import { useUsers } from './../hooks/useUsers';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useTranslation } from 'react-i18next';
import { InputText } from 'primereact/inputtext';
import { Divider } from 'primereact/divider';
import { Dropdown } from 'primereact/dropdown';
import {RoleService} from '../services/RoleService';
import { useState ,useEffect} from 'react';
import { InputSwitch } from 'primereact/inputswitch';

export default function Users() {
  const { t } = useTranslation();
  const tOrDefault = (key, defaultValue) => t(key, { defaultValue });
  

  const columns = [
    { field: 'id', header: tOrDefault('table.id', 'ID'), sortable: true, style: { width: '6rem' } },
    { field: 'nom', header: tOrDefault('table.name', 'Name'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByName', 'Search by name') },
    { field: 'username', header: tOrDefault('table.username', 'Username'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByUsername', 'Search by username') },
    { field: 'phone', header: tOrDefault('table.phone', 'Phone'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByPhone', 'Search by phone') },
    { field: 'roleT.nom', header: tOrDefault('table.role', 'Role'), sortable: true, filter: true, filterPlaceholder: tOrDefault('table.searchByRole', 'Search by role') },
    { field: 'activated', header: tOrDefault('table.activated', 'Activated'), sortable: true, body: (rowData) => (
      <span className={`badge ${rowData.activated ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
        {rowData.activated ? tOrDefault('table.yes', 'Yes') : tOrDefault('table.no', 'No')}
      </span>
    ) },
  ];
 const [roles, setRoles] = useState([]);

  useEffect(() => {
    RoleService.getAll().then(data => setRoles(data));
  }, []);
  // Dialog مخصص
  const renderUserDialog = ({
    visible,
    onHide,
    saving,
    editingItem,
    formData,
    onFormChange,
    onSave,
    title
  }) => {
    const isEditing = !!editingItem;

    return (
      <Dialog
        header={isEditing ? `Edit ${title}` : `Create New ${title}`}
        visible={visible}
        style={{ width: '40rem' }}
        modal
        onHide={onHide}
      >
        <div className="flex flex-column gap-3">
          <div className="grid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label>Full Name *</label>
                <InputText
                  value={formData.nom || ''}
                  onChange={(e) => onFormChange('nom', e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label>Usernamedd *</label>
                <InputText
                  value={formData.username || ''}
                  onChange={(e) => onFormChange('username', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label>Phone Number</label>
                <InputText
                  value={formData.phone || ''}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label>Password {isEditing ? '(leave blank to keep current)' : '*'}</label>
                <InputText
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => onFormChange('password', e.target.value)}
                  className="w-full"
                  placeholder={isEditing ? 'New password (optional)' : 'Enter password'}
                />
              </div>
            </div>
          </div>
          <div>
            <label>Role</label>
            <Dropdown
              value={formData.roleT || null}
              onChange={(e) => onFormChange('roleT', e.target.value)}
              options={roles}
              optionLabel="nom"
              placeholder="Select Role"
              className="w-full md:w-14rem"
            />
          </div>
          <div>
            <InputSwitch
              checked={!!formData.activated}
              onChange={(e) => onFormChange('activated', e.value)}
            />
          </div>
          <Divider />

          <div className="flex justify-content-end gap-2">
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
  };

  return (
    <EntityTable
      useHook={useUsers}
      title="Users"
      entityName="user"
      columns={columns}
      // استخدم renderDialog بدلاً من dialogFields
      renderDialog={renderUserDialog}
    />
  );
}
