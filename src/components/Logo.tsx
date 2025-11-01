import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <div className="flex items-center">
        <img
          src="/eliel-figueiredo-logo.png" // Assuming you place the image here
          alt="Eliel Figueirêdo Logo"
          className="h-20 w-auto" // Adjust height as needed
        />
        {/* If you want to display the text separately or as a fallback, you can uncomment below */}
        {/* <span className="ml-3 text-4xl font-extrabold text-[#004A99]">Eliel Figueirêdo</span> */}
      </div>
      {/* If the image already contains the text, you might not need these spans.
          I'm keeping them here as an example if you only use the icon part of the logo. */}
      {/* <span className="text-sm font-medium text-[#3CB371] uppercase tracking-wider">
        Laboratório e Imagem
      </span> */}
    </div>
  );
};

export default Logo;