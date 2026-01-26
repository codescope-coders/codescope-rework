import Image from "next/image";

type props = {
  logo: string;
};

export const Client = ({ logo }: props) => {
  return (
    <div className="client">
      <Image
        src={logo}
        width={150}
        height={500}
        style={{ minWidth: "150px", height: "auto" }}
        alt="client"
      />
    </div>
  );
};
