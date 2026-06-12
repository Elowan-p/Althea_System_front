import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';
import ChatbotWidget from '../ChatbotWidget/ChatbotWidget';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">
        {children || <Outlet />}
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default Layout;
