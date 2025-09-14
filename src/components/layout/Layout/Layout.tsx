import React, { FC, PropsWithChildren, lazy, Suspense } from 'react';
import { Main } from './Layout.styled';
import Navbar from '../Navbar/Navbar';
import Header from 'components/Header/Header';
import { useRouter } from 'next/router';

const Footer = lazy(() => import('components/layout/Footer/Footer'));
// const LoginSignup = lazy(() => import('components/LoginSignup/LoginSignup'));

const FooterPlaceholder = () => <div style={{ minHeight: '500px' }} />;
const EmptyPlaceholder = () => null;

const LayoutComponent: FC<PropsWithChildren> = React.memo(({ children }) => {
	return (
		<>
			<Header />
			<Navbar />
			<Main>
			{children}
		</Main>
		<Suspense fallback={<FooterPlaceholder />}>
			<Footer />
		</Suspense>
		{/* <Suspense fallback={<EmptyPlaceholder />}>
			<LoginSignup />
		</Suspense> */}
		</>
	);
});

LayoutComponent.displayName = 'Layout';

export default LayoutComponent;
