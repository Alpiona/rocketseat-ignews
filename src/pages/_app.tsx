import { AppProps } from 'next/app';
import { Provider } from 'next-auth/client';
import { Header } from '../components/Header';

import '../styles/global.scss';

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Provider session={pageProps.session}>
      <Header />
      <Component {...pageProps} />
    </Provider>
  );
}
