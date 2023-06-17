import { Button, FileInput, Input } from '@gear-js/ui';
import { useAlert } from '@gear-js/react-hooks';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useIPFS, useSendNFTMessage } from 'hooks';
import { getMintDetails, getMintPayload } from 'utils';
import styles from './Create.module.scss';

type AttributesValue = { key: string; value: string };
type Values = { name: string; description: string; image: FileList; attributes: AttributesValue[]; rarity: string };

const defaultValues = { name: '', description: ''};

function AddSeeder() {
  const { formState, control, register, handleSubmit, resetField, reset } = useForm<Values>({ defaultValues });
  const { errors } = formState;

  const alert = useAlert();
  const sendMessage = useSendNFTMessage();

  const [isAnyAttribute, setIsAnyAttribute] = useState(false);
  const [isRarity, setIsRarity] = useState(false);

  const triggerImageChange = () => {
    // hacky fix cuz reset() doesn't trigger file input's onChange
    const changeEvent = new Event('change', { bubbles: true });
    document.querySelector('[name="image"]')?.dispatchEvent(changeEvent);
  };

  const resetForm = () => {
    reset();
    triggerImageChange();
    setIsAnyAttribute(false);
    setIsRarity(false);
  };

  const onSubmit = async (data: Values) => {
    const { name, description, attributes, rarity } = data;
    const image = data.image[0];

    const details = isAnyAttribute || isRarity ? getMintDetails(isAnyAttribute ? attributes : undefined, rarity) : '';
  };

  return (
    <>
      <h2 className={styles.heading}>Add Seeder Wallet to Program</h2>
      <div className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.item}>
            <Input label="Wallet" className={styles.input} {...register('name', { required: 'Wallet is required' })} />
            <p className={styles.error}>{errors.name?.message}</p>
          </div>
          <Button type="submit" text="Create" className={styles.button} block />
        </form>
      </div>
    </>
  );
}

export { AddSeeder };
