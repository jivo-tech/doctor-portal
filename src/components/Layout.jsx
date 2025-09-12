import { useState } from 'react';

// SVG icon for the close button
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// The list of navigation links
const navLinks = [
    { name: 'Masterclass', href: '/jivo-hub/jivo-doctor-masterclass.html' },
    { name: 'Patient Stories', href: '/jivo-hub/jivo-patient-stories.html' },
    { name: 'Briefing Room', href: '/jivo-hub/jivo-briefing-room.html' },
    { name: 'JDP Role', href: '/jivo-hub/jdp-role.html' },
    { name: 'Referral Protocol', href: '/jivo-hub/referral-protocol.html' },
    { name: 'Remuneration', href: '/jivo-hub/remuneration-structure.html' },
    { name: 'Refer Patient', href: 'https://forms.gle/eX5NyM4L8J4DvRHn8' },
    { name: 'Invite Doctor', href: 'https://signup.jivo.co/' },
    { name: 'Book a Call', href: 'https://calendly.com/umang-kpvl/welcome-doctor' },
    { name: 'Marketing Material', href: 'https://docs.google.com/forms/d/e/1FAIpQLSdZXGj6X2Ff6f7Zyw6D9W4sih-PX--j-cu8g4yuFBUKNnqcQQ/viewform' },
];

// The Layout component now accepts an `onSignOut` prop
export default function Layout({ children, onSignOut }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div>
            {/* MAIN HEADER (The blue bar) */}
            <header className="bg-blue-800 text-white p-4 h-[70px] flex items-center justify-between fixed top-0 left-0 right-0 z-20">
                <div className="flex-1">
                    <button onClick={toggleMenu} className="p-2">
                        <div className="space-y-1.5">
                            <span className="block w-6 h-0.5 bg-white"></span>
                            <span className="block w-6 h-0.5 bg-white"></span>
                            <span className="block w-6 h-0.5 bg-white"></span>
                        </div>
                    </button>
                </div>
                <div className="flex-1 text-center">
                    <h1 className="text-lg font-bold">Jivo Doctor Partner Hub</h1>
                </div>
                <div className="flex-1 text-right">
                    {/* The Sign Out button now triggers the onSignOut function */}
                    <button onClick={onSignOut} className="bg-white text-blue-800 font-semibold py-2 px-4 rounded-md text-sm">
                        Sign Out
                    </button>
                </div>
            </header>

            {/* SLIDE-OUT MENU PANEL */}
            <div className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex justify-end">
                     <button onClick={toggleMenu} className="p-2">
                        <CloseIcon />
                    </button>
                </div>
                <nav>
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.name}>
                                <a 
                                  href={link.href} 
                                  className="block py-3 px-6 text-gray-700 font-semibold hover:bg-gray-100"
                                  target={link.href.startsWith('http') ? '_blank' : '_self'}
                                  rel="noopener noreferrer"
                                >
                                    {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* OVERLAY (Dims the background) */}
            {isMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20"
                    onClick={toggleMenu}
                ></div>
            )}

            {/* PAGE CONTENT */}
            <main className="pt-[70px]">
                {children}
            </main>
        </div>
    );
}

