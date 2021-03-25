import { signIn, signOut, useSession } from 'next-auth/client';
import { FaGithub } from 'react-icons/fa';
import { FiX } from 'react-icons/fi';

import styles from './styles.module.scss';

export function SignInButton(): JSX.Element {
  const [session] = useSession();

  return session ? (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signOut()}
    >
      <FaGithub color="#04d361" />
      André Piona
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn('github')}
    >
      <FaGithub color="#eba417" />
      Sign in with GitHub
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  );
}
