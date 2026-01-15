import React from 'react';
import { NavLink } from 'react-router-dom';
import themeConfig from '../theme.config';
interface BreadcrumbItem {
    to?: string | boolean;
    label: string;
    isCurrent?: boolean;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="text-left pr-8">
            {items.map((item, index) => {
                const formattedLabel = item.isCurrent ? item.label : `${item.label} > `;

                if (item.isCurrent) {
                    return (
                        <span key={index} className="underline-offset-1 text-black">
                            {formattedLabel}
                        </span>
                    );
                }
                if (typeof item.to === 'boolean') {
                    return <a key={index} onClick={() => {history.back()}} className={`underline-offset-1 text-themePrimary pointer`}>
                        {formattedLabel}
                    </a>
                }
                return (
                    <NavLink key={index} to={item.to || '#'} className={`underline-offset-1 text-themePrimary`}>
                        {formattedLabel}
                    </NavLink>
                );
            })}
        </nav>
    );
};

export default Breadcrumbs;
