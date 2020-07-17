import React from 'react';
import defaultResolve, { DeleteAction } from 'part:@sanity/base/document-actions'
import ConfirmDelete from '@sanity/desk-tool/lib/components/ConfirmDelete';
import TrashIcon from 'part:@sanity/base/trash-icon'
import { IResolverProps, IUseDocumentOperationResult } from '../types';
import { getConfig, getSanityClient, getBaseIdFromId } from '../utils';
import { useDocumentOperation } from '@sanity/react-hooks';
import { SanityDocument } from '@sanity/client';

/**
 * This code is mostly taken from the defualt DeleteAction provided by Sanity
 */

const DISABLED_REASON_TITLE = {
  NOTHING_TO_DELETE: "This document doesn't yet exist or is already deleted"
}

export const DeleteWithi18nAction = (props: IResolverProps) => {
  const client = getSanityClient();
  const config = getConfig(props.type);
  const baseDocumentId = getBaseIdFromId(props.id);
  const {delete: deleteOp} = useDocumentOperation(props.id, props.type) as IUseDocumentOperationResult;
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = React.useState(false);

  return {
    icon: TrashIcon,
    disabled: Boolean(deleteOp.disabled),
    title: (deleteOp.disabled && DISABLED_REASON_TITLE[deleteOp.disabled]) || '',
    label: isDeleting ? config.messages.deleteAll?.deleting : config.messages.deleteAll?.buttonTitle,
    onHandle: () => { setConfirmDialogOpen(true); },
    dialog: isConfirmDialogOpen && {
      type: 'legacy',
      onClose: props.onComplete,
      title: 'Delete',
      content: (
        <ConfirmDelete
          draft={props.draft}
          published={props.published}
          onCancel={() => {
            setConfirmDialogOpen(false);
            props.onComplete();
          }}
          onConfirm={async () => {
            setIsDeleting(true);
            setConfirmDialogOpen(false);
            deleteOp.execute();
            const translatedDocuments = await client.fetch<SanityDocument[]>('*[_id match $id]', {
              id: [...baseDocumentId.split('-').map((id, index) => index === 0 ? `${id}*` : `*${id}*`), '*__i18n_*'],
            });
            const transaction = client.transaction();
            translatedDocuments.forEach(doc => transaction.delete(doc._id));
            await transaction.commit();
            props.onComplete();
          }}
        />
      )
    }
  }
}