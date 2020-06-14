import React, { useEffect, useState } from 'react';
import { Form, Input, Grid, Card, Statistic } from 'semantic-ui-react';

import { useSubstrate } from './substrate-lib';
import { TxButton } from './substrate-lib/components';
import {blake2AsHex} from "@polkadot/util-crypto";


//copy from TemplateModule.js

function Main (props) {
  const { api } = useSubstrate();
  const { accountPair } = props;

  // The transaction submission status
  const [status, setStatus] = useState('');
  const [digest, setDigest] = useState('');
  const [owner, setOwner] = useState('');
  const [blockNumber, setBlockNumber] = useState(0);
  const [dest, setDest] = useState('');

  useEffect(() => {
    let unsubscribe;
    api.query.poeModule.proofs(digest, (result) => {
      setOwner(result[0].toString());
      setBlockNumber(result[1].toNumber());
    }).then(unsub => {
      unsubscribe = unsub;
    })
      .catch(console.error);

    return () => unsubscribe && unsubscribe();
  }, [digest, api.query.poeModule]);

  // 选择文件事件处理，  将文件内容做哈希处理， setDigest(hash)
  const handleFileChosen = (file) => {
    let fileReader = new FileReader();

    const bufferToDigest = () => {
      const content = Array.from(new Uint8Array(fileReader.result)).map(
          (b) => b.toString(16).padStart(2, '0')).join('');

      const hash = blake2AsHex(content, 256);
      setDigest(hash);

    }

    fileReader.onload = bufferToDigest;

    fileReader.readAsArrayBuffer(file);
  };

  // claim 转移的接收人事件处理， setDest(data.value)
  const onDestChange = (_, data) => {
      setDest(data.value);
  }

  return (
    <Grid.Column width={8}>
      <h1>Proof of Existence Module</h1>
      <Form>
        <Form.Field>
            //File Field
          <Input type='file' id='file' label='Your File' onChange={(e) => handleFileChosen(e.target.files[0])} />
          // 接收人 Field
          <Input type='text' id='dest' laber='Receiver' state='dest' onChange={onDestChange}/>
        </Form.Field>
        <Form.Field>
          <TxButton
              // 使用 accountPair
              accountPair={accountPair}
              label='Create Claim'
              setStatus={setStatus}
              type='SIGNED-TX'
              attrs={{
                  palletRpc: 'poeModule',
                  // 事件触发的回调函数 : createClaim
                  callable: 'createClaim',
                  inputParams: [digest],
                  paramFields: [true]

              }}
          />
          <TxButton
              accountPair={accountPair}
              label='Revoke Claim'
              setStatus={setStatus}
              type='SIGNED-TX'
              attrs={{
                palletRpc: 'poeModule',
                callable: 'revokeClaim',
                inputParams: [digest],
                paramFields: [true]

              }}
          />
            <TxButton
                accountPair={accountPair}
                label='Transfer Claim'
                setStatus={setStatus}
                type='SIGNED-TX'
                attrs={{
                    palletRpc: 'poeModule',
                    callable: 'transferClaim',
                    // transferClaim 触发调用的函数多一个dest
                    inputParams: [digest, dest],
                    paramFields: [true]

                }}
            />
        </Form.Field>
        <div>{status}</div>
        <div>{`Claim info, owner: ${owner}, blockNumber: ${blockNumber}`}</div>

      </Form>
    </Grid.Column>
  );
}

export default function PoeModule (props) {
  const { api } = useSubstrate();
  // export function for poeModule
  return (api.query.poeModule && api.query.poeModule.proofs
    ? <Main {...props} /> : null);
}
