import { useAccount } from '@gear-js/react-hooks';
import { Logo } from './logo';
import { CreateSeeder } from './create-seeder';
import { CreateLink } from './create-link'; 
import { CreateProof } from './create-proof';
import { ReadStatelink } from './readstatelink';
import {PingLink} from './pinglink';
import { Account } from './account';
import styles from './Header.module.scss';

type Props = {
  isAccountVisible: boolean;
};

function Header({ isAccountVisible }: Props) {
  const { account } = useAccount();

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Logo />
        {account && <CreateSeeder />}
        {account && <ReadStatelink />}
        {account && <CreateProof />}
        {account && <PingLink />}
      </nav>
      {isAccountVisible && <Account />}
    </header>
  );
}

export { Header };
