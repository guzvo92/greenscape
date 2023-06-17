import { useAccount, useApi, useAlert } from "@gear-js/react-hooks";
import { web3FromSource } from "@polkadot/extension-dapp";
import { getProgramMetadata } from "@gear-js/api";
import { Button } from "@gear-js/ui";

function Ping() {
  const alert = useAlert();
  const { accounts, account } = useAccount();
  const { api } = useApi();

  // Add your programID
  const programID =
    "0x12ab1da6471d26e2191608e286d89668965889a1cc7eda90f0d36bcfcf1d1754";

  // Add your metadata.txt
  const meta =
    "01000000000100000000010100000001000000000000000000010600000071072800000005020004083868656c6c6f5f776f726c645f696f34496e7075744d65737361676558000114184164646c6f630c0008010c6933320000000118537472696e670000000118537472696e670000002452656d6f76656c6f63040008010c6933320001002441646453656564657204000c011c4163746f7249640002003052656d6f766553656564657204000c011c4163746f7249640003003853656e6448656c6c6f5265706c7900040000080000050b000c10106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004001001205b75383b2033325d00001000000320000000140014000005030018083868656c6c6f5f776f726c645f696f2045636f737461746500001001206465706c6f7965720c011c4163746f72496400011c6e736974696f7308010c69333200011473697465731c01485665633c4f7574736974657374727563743e0001486c6973745f7365656465725f77616c6c65742401305665633c4163746f7249643e00001c000002200020083868656c6c6f5f776f726c645f696f344f75747369746573747275637400000c010c69647808010c69333200011c6c617469747564000118537472696e670001206c6f6e6769747564000118537472696e670000240000020c00";

  const metadata = getProgramMetadata(`0x${meta}`);

  const messageinit = "0x346dad2db89c270330b0b895fc4c0b29b04901ad693f8334b97630872d19ae61";
 
  const message: any = {
    destination: programID, // programId
    payload: {"AddSeeder":messageinit},
    gasLimit: 12998192450,
    value: 0,
  };

  const signer = async () => {
    const localaccount = account?.address;
    const isVisibleAccount = accounts.some(
      (visibleAccount) => visibleAccount.address === localaccount
    );

    if (isVisibleAccount) {
      // Create a message extrinsic
      const extrinsic = api.message.send(message, metadata);

      const injector = await web3FromSource(accounts[0].meta.source);

      extrinsic
        .signAndSend(
          accounts[0].address,
          { signer: injector.signer },
          ({ status }) => {
            if (status.isInBlock) {
              console.log(
                `Completed at block hash #${status.asInBlock.toString()}`
              );
              alert.success(`Block hash #${status.asInBlock.toString()}`);
            } else {
              console.log(`Current status: ${status.type}`);
              if (status.type === "Finalized") {
                alert.success(status.type);
              }
            }
          }
        )
        .catch((error: any) => {
          console.log(":( transaction failed", error);
        });
    } else {
      alert.error("Account not available to sign");
    }

    // Usermessagesent subscription
    const unsub = api.gearEvents.subscribeToGearEvent(
      "UserMessageSent",
      ({
        data: {
          message: { id, source, destination, payload, value },
        },
      }) => {
        console.log(`
      messageId: ${id.toHex()}
      source: ${source.toHex()}
      payload: ${payload.toHuman()}
      `);
      }
    );
  };

  return <Button text="Ping" onClick={signer} />;
}

export { Ping };
