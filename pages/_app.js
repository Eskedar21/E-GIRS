import '../app/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { SidebarProvider } from '../contexts/SidebarContext';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Component {...pageProps} />
      </SidebarProvider>
    </AuthProvider>
  );
}

