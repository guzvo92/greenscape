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

const IMAGE_FILE_TYPES = ['image/png', 'image/gif', 'image/jpeg'];

const validateImage = {
  required: (files: FileList) => !!files.length || 'Attach image',
  size: (files: FileList) => files[0].size / 1024 ** 2 < 10 || 'Image size should not exceed 10MB',
  extension: (files: FileList) => IMAGE_FILE_TYPES.includes(files[0].type) || 'Image should be .jpg, .png or .gif',
};

function CreateProof() {
  const { formState, control, register, handleSubmit, resetField, reset } = useForm<Values>({ defaultValues });
  const { errors } = formState;

  const alert = useAlert();
  const ipfs = useIPFS();
  const sendMessage = useSendNFTMessage();

  const [isAnyAttribute, setIsAnyAttribute] = useState(false);
  const [isRarity, setIsRarity] = useState(false);

  useEffect(() => {
    resetField('attributes');
  }, [isAnyAttribute, resetField]);

  useEffect(() => {
    resetField('rarity');
  }, [isRarity, resetField]);

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

    ipfs
      .add(image)
      .then(({ cid }) => cid)
      .then(async (imageCid) => (details ? { detailsCid: (await ipfs.add(details)).cid, imageCid } : { imageCid }))
      .then(({ imageCid, detailsCid }) => getMintPayload(name, description, imageCid, detailsCid))
      .then((payload) => sendMessage(payload, { onSuccess: resetForm }))
      .catch(({ message }: Error) => alert.error(message));
  };

  return (
    <>
      <h2 className={styles.heading}>Upload a Proof</h2>
      <div className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.item}>
            <Input label="Name" className={styles.input} {...register('name', { required: 'Name is required' })} />
            <p className={styles.error}>{errors.name?.message}</p>
          </div>

          <div className={styles.item}>
            <FileInput
              label="Image"
              className={styles.input}
              accept={IMAGE_FILE_TYPES.join(', ')}
              {...register('image', { validate: validateImage })}
            />
            <p className={styles.error}>{errors.image?.message}</p>
          </div>
          <Button type="submit" text="Create" className={styles.button} block />
        </form>
      </div>
    </>
  );
}

export { CreateProof };
