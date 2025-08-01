import React from 'react';

interface ShippingAddressProps {
  address: any;
  className?: string;
}

const ShippingAddress: React.FC<ShippingAddressProps> = ({ address, className = '' }) => {
  if (!address) return <span className="text-muted-foreground">No address provided</span>;

  // Handle string addresses
  if (typeof address === 'string') {
    return <div className={className}>{address}</div>;
  }

  // Handle object addresses
  const {
    name,
    street,
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    pincode,
    country,
    phone
  } = address;

  return (
    <div className={`space-y-1 ${className}`}>
      {name && <div className="font-medium">{name}</div>}
      {(street || address_line_1) && <div>{street || address_line_1}</div>}
      {address_line_2 && <div>{address_line_2}</div>}
      <div>
        {city && <span>{city}</span>}
        {state && <span>, {state}</span>}
        {(postal_code || pincode) && <span> - {postal_code || pincode}</span>}
      </div>
      {country && <div>{country}</div>}
      {phone && <div className="text-sm text-muted-foreground">Phone: {phone}</div>}
    </div>
  );
};

export default ShippingAddress;