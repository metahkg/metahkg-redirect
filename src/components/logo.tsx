/*
 Copyright (C) 2022-present Wong Chun Yat (wcyat)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import Image from "next/image";
import React from "react";

/**
 * @description Metahkg logo, in different formats
 */
export default function MetahkgLogo(props: {
  light?: boolean;
  dark?: boolean;
  ua?: boolean;
  text?: boolean;
  filled?: boolean;
  svg?: boolean;
  height: number;
  width: number;
  sx?: React.CSSProperties;
  className?: string;
}) {
  const { light, dark, ua, text, filled, svg, height, width, sx, className } =
    props;
  return (
    <Image
      className={`${
        svg
          ? "dark:invert dark:sepia-0 dark:saturate-0 dark:hue-rotate-[93deg] dark:!brightness-[103%]"
          : ""
      } ${className || ""}`}
      style={sx}
      src={
        (svg && "/images/logo.svg") ||
        (light &&
          (filled
            ? "/images/logo-white-filled.png"
            : "/images/logo-white.png")) ||
        (text && "/images/logo_with_text.png") ||
        (dark && "/images/logo.png") ||
        (ua && "/images/metahkg-ua.png") ||
        "/images/logo.png"
      }
      alt="Metahkg Logo"
      height={height}
      width={width}
    />
  );
}
