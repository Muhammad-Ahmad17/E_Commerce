export interface UserRegister{
    fullName: string;
    email: string;
    password:string;
    role: "buyer" | "vendor";
    preferences?: string[];
    vendorName?: string;    
    addressLine1: string;
    city: string;    
    postalCode: string;
    country: string;
}

