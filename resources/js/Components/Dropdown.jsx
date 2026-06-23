import { Link } from '@inertiajs/react';
import { createContext, useContext, useState } from 'react';

const DropDownContext = createContext();

const dropdownStyle = `
    @keyframes dropdownOpen {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    .dropdown-content-open {
        animation: dropdownOpen 0.2s ease-out;
    }
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = dropdownStyle;
    document.head.appendChild(style);
}

const Dropdown = ({ children }) => {
    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen((previousState) => !previousState);
    };

    return (
        <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
            <div style={{ position: 'relative' }}>{children}</div>
        </DropDownContext.Provider>
    );
};

const Trigger = ({ children }) => {
    const { open, setOpen, toggleOpen } = useContext(DropDownContext);

    return (
        <>
            <div onClick={toggleOpen}>{children}</div>

            {open && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 40,
                    }}
                    onClick={() => setOpen(false)}
                ></div>
            )}
        </>
    );
};

const Content = ({
    align = 'right',
    width = '48',
    contentClasses = 'py-1 bg-white',
    children,
}) => {
    const { open, setOpen } = useContext(DropDownContext);

    let alignmentClasses = 'origin-top';

    if (align === 'left') {
        alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
    } else if (align === 'right') {
        alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
    }

    let widthClasses = '';

    if (width === '48') {
        widthClasses = 'w-48';
    }

    return (
        <>
            {open && (
                <div
                    className="dropdown-content-open"
                    style={{
                        position: 'absolute',
                        zIndex: 50,
                        marginTop: '8px',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        right: align === 'right' ? 0 : 'auto',
                        left: align === 'left' ? 0 : 'auto',
                        minWidth: width === '48' ? '192px' : 'auto',
                    }}
                    onClick={() => setOpen(false)}
                >
                    <div
                        style={{
                            borderRadius: '6px',
                            border: '1px solid rgba(0, 0, 0, 0.05)',
                            backgroundColor: '#fff',
                        }}
                    >
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};

const DropdownLink = ({ className = '', children, ...props }) => {
    return (
        <Link
            {...props}
            className={
                'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ' +
                className
            }
        >
            {children}
        </Link>
    );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;
