import { Route, Routes } from 'react-router-dom';
import { OnLogin, InfoText } from 'components';
import { Create } from './create';
import { Home } from './home';
import { NFT } from './nft';
import { CreateProof } from './createproof';
import { AddSeeder } from './addseeder';
import {Readstate} from './getstate';
import {Ping} from './ping';

const routes = [
  { path: '/', Page: Home },
  { path: 'nft/:id', Page: NFT },
  { path: 'create', Page: Create, isPrivate: true },
  { path: 'createproof', Page: CreateProof, isPrivate: true },
  { path: 'addseederlink', Page: AddSeeder, isPrivate: true },
  { path: 'readstatelink', Page: Readstate, isPrivate: true },
  { path: 'pinglink', Page: Ping, isPrivate: true },
];

function Routing() {
  const getRoutes = () =>
    routes.map(({ path, Page, isPrivate }) => (
      <Route
        key={path}
        path={path}
        element={
          isPrivate ? (
            <OnLogin fallback={<InfoText text="In order to use all features, please login" />}>
              <Page />
            </OnLogin>
          ) : (
            <Page />
          )
        }
      />
    ));

  return <Routes>{getRoutes()}</Routes>;
}

export { Routing };
