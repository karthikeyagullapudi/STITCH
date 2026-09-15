import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useAccount } from '../hook/useAccount.js';
import AddressForm from './AddressForm.jsx';
import { cardCls, cardTitleCls, ghostBtnCls, feedbackCls } from './styles.js';

const actionCls =
  'font-display text-[11px] uppercase tracking-wide text-muted transition-colors hover:text-accent';

export const AddressLines = ({ address }) => (
  <div className="text-sm leading-relaxed text-muted">
    <p className="font-display font-semibold uppercase text-paper">
      {address.fullName}
    </p>
    <p>
      {address.line1}
      {address.line2 && `, ${address.line2}`}
    </p>
    <p>
      {address.city}, {address.state} {address.postalCode}
    </p>
    <p>{address.country}</p>
    <p>{address.phone}</p>
  </div>
);

const AddressBook = ({ addresses }) => {
  const { handleAddAddress, handleUpdateAddress, handleDeleteAddress } =
    useAccount();
  // null = closed, 'new' = adding, otherwise the id being edited.
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);

  const closeOnSuccess = (result) => {
    if (result.success) setEditing(null);
    return result;
  };

  const handleDelete = async (addressId) => {
    const result = await handleDeleteAddress(addressId);
    setError(result.success ? null : result.error);
  };

  return (
    <section className={cardCls}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className={`${cardTitleCls} mb-0`}>Address Book</h2>
        {editing !== 'new' && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className={`${ghostBtnCls} flex items-center gap-2`}
          >
            <FiPlus className="h-4 w-4" />
            Add Address
          </button>
        )}
      </div>

      {error && <p className={`${feedbackCls.error} mb-4`}>{error}</p>}

      {editing === 'new' && (
        <div className="mb-6 border border-line bg-panel p-4">
          <AddressForm
            submitLabel="Save Address"
            onSubmit={async (payload) =>
              closeOnSuccess(await handleAddAddress(payload))
            }
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {addresses.length === 0 && editing !== 'new' && (
        <p className="text-sm text-muted">No saved addresses yet.</p>
      )}

      <div className="space-y-4">
        {addresses.map((address) =>
          editing === address._id ? (
            <div key={address._id} className="border border-line bg-panel p-4">
              <AddressForm
                initial={address}
                submitLabel="Update Address"
                onSubmit={async (payload) =>
                  closeOnSuccess(await handleUpdateAddress(address._id, payload))
                }
                onCancel={() => setEditing(null)}
              />
            </div>
          ) : (
            <div
              key={address._id}
              className="flex flex-col justify-between gap-4 border border-line bg-panel p-4 sm:flex-row"
            >
              <AddressLines address={address} />
              <div className="flex flex-row items-start gap-4 sm:flex-col sm:items-end">
                {address.isDefault ? (
                  <span className="bg-accent px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wide text-ink">
                    Default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateAddress(address._id, {
                        ...address,
                        isDefault: true,
                      })
                    }
                    className={actionCls}
                  >
                    Set as Default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(address._id)}
                  className={actionCls}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(address._id)}
                  className={`${actionCls} hover:text-red-400`}
                >
                  Delete
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
};

export default AddressBook;
