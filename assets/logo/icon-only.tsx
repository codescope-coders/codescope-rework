import * as React from "react";

type IconOnlyProps = React.SVGProps<SVGSVGElement>;

export function IconOnly(props: IconOnlyProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="35"
      height="25"
      viewBox="0 0 35 25"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_866_3534)">
        <path
          d="M0 24.7369H34.9641V0H0V24.7369ZM3.2101 10.2661L31.754 6.52303V18.2139L3.2101 14.4956V10.2611V10.2661Z"
          fill="#232323"
        />
      </g>
      <defs>
        <clipPath id="clip0_866_3534">
          <rect width="35" height="25" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
