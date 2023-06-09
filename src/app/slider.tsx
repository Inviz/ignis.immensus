"use client";

import SVGPathCommander from "svg-path-commander";
import { roundCorners } from "svg-round-corners";
import { useEffect, useMemo, useRef, useState } from "react";
type Position = {
  path?: string;
  expandedPath?: string;
  left: number;
  top: number;
  angle: number;
  titleAngle: number;
};
type Item = {
  image: string;
  title: string;
  rect: Rect;
  focus: Rect;
  focusLarge?: Rect;
  className: string;
  position?: Position;
};

type Rect = { left: number; top: number; width: number; height: number };

function computeZoom(
  imageSize: Rect,
  imageSection: Rect,
  containerSize: Rect,
  focusArea: Rect = containerSize
) {
  // Step 1: Size the image so that it makes image section to cover the focus area
  // Step 1: Size the image so that it makes image section to cover the focus area
  const scale = Math.max(
    focusArea.width / imageSection.width,
    focusArea.height / imageSection.height
  );

  const backgroundSize = {
    width: ((imageSize.width * scale) / containerSize.width) * 100,
    height: ((imageSize.height * scale) / containerSize.height) * 100,
  };

  console.log([
    imageSize.height,
    scale,
    imageSize.height * scale,
    containerSize.height,
  ]);

  // Step 2: Position the image so that the selected section is at the top left of the focus area
  const backgroundPosition = {
    x:
      ((imageSection.left * scale - focusArea.left) /
        (imageSize.width * scale - containerSize.width)) *
      100,
    y:
      ((imageSection.top * scale - focusArea.top) /
        (imageSize.height * scale - containerSize.height)) *
      100,
  };

  console.log(backgroundPosition);
  // Step 3: Respect the ratio of the image and avoid stretching it when computing background size
  return {
    backgroundSize: `${backgroundSize.width}% ${backgroundSize.height}%`,
    backgroundPosition: `${
      isFinite(backgroundPosition.x) ? backgroundPosition.x : 0
    }% ${isFinite(backgroundPosition.y) ? backgroundPosition.y : 0}%`,
  };
}

// @ts-ignore
import { interpolate } from "flubber";
const logo = (
  <svg
    width="100"
    height="100"
    style={{
      width: "100%",
      height: "100%",
    }}
    preserveAspectRatio="none"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M35.5978 14.8016L44.8484 32.7459L44.5347 36.9656L41.3853 34.1424L35.5978 14.8016Z"
      fill="white"
    />
    <path
      d="M47.2029 40.5364L49.841 12.1074L52.4792 40.5364L49.841 45.9033L47.2029 40.5364Z"
      fill="white"
    />
    <path
      d="M54.7564 41.4774L76.725 23.241L58.4901 45.2115L52.8272 47.1409L54.7564 41.4774Z"
      fill="white"
    />
    <path
      d="M85.1635 35.8828L65.8245 41.6708L63.0016 44.8205L67.2209 45.1342L85.1635 35.8828Z"
      fill="white"
    />
    <path
      d="M67.122 55.447L84.8885 65.0336L65.6612 58.8846L62.8985 55.6833L67.122 55.447Z"
      fill="white"
    />
    <path
      d="M64.0843 85.4486L54.8337 67.5044L55.1474 63.2847L58.2968 66.1079L64.0843 85.4486Z"
      fill="white"
    />
    <path
      d="M41.0846 65.9445L34.9361 85.1736L44.5219 67.4055L44.2898 63.1815L41.0846 65.9445Z"
      fill="white"
    />
    <path
      d="M58.5975 34.3058L64.746 15.0767L55.1603 32.8448L55.3923 37.0687L58.5975 34.3058Z"
      fill="white"
    />
    <path
      d="M14.5186 64.3718L33.8576 58.5838L36.6805 55.434L32.4613 55.1204L14.5186 64.3718Z"
      fill="white"
    />
    <path
      d="M32.5601 44.8077L14.7936 35.2211L34.0209 41.3701L36.7836 44.5713L32.5601 44.8077Z"
      fill="white"
    />
    <path
      d="M87.8618 50.1273L59.4354 47.489L54.0689 50.1273L59.4354 52.7657L87.8618 50.1273Z"
      fill="white"
    />
    <path
      d="M58.4901 55.0431L76.725 77.0137L54.7564 58.7772L52.8272 53.1138L58.4901 55.0431Z"
      fill="white"
    />
    <path
      d="M49.841 88.1472L47.2029 59.7182L49.841 54.3513L52.4792 59.7182L49.841 88.1472Z"
      fill="white"
    />
    <path
      d="M41.192 55.0431L22.9571 77.0137L44.9257 58.7772L46.8549 53.1138L41.192 55.0431Z"
      fill="white"
    />
    <path
      d="M11.8203 50.1273L40.2467 47.489L45.6132 50.1273L40.2467 52.7657L11.8203 50.1273Z"
      fill="white"
    />
    <path
      d="M44.9257 41.4774L22.9571 23.241L41.192 45.2115L46.8549 47.1409L44.9257 41.4774Z"
      fill="white"
    />
    <path
      d="M46.9022 50.1402L47.7529 48.0561L49.8282 47.1881L51.912 48.0389L52.7799 50.1144L51.9292 52.1941L49.8582 51.3433L47.783 52.2113L47.7744 52.207L46.9022 50.1402Z"
      fill="white"
    />
  </svg>
);

const title = (
  <svg
    viewBox="0 0 88 27"
    style={{
      width: "80%",
      margin: "-6% auto 0 auto",
      display: "block",
    }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24.0847 12.5454C24.1213 12.425 24.1517 12.2744 24.1822 12.0997C24.2126 11.9191 24.237 11.7022 24.2614 11.4372C24.2857 11.1722 24.304 10.859 24.3162 10.4977C24.3284 10.1303 24.3345 9.70267 24.3345 9.21483V3.60765C24.3345 3.11981 24.3284 2.6922 24.3162 2.33083C24.304 1.96345 24.2857 1.65026 24.2614 1.38526C24.237 1.11424 24.2126 0.891397 24.1822 0.710715C24.1517 0.530033 24.1213 0.385493 24.0847 0.265038V0.228903H26.1801V0.265038C26.1436 0.385493 26.107 0.536055 26.0766 0.710715C26.0461 0.891397 26.0217 1.11424 25.9974 1.38526C25.9791 1.65026 25.9608 1.96345 25.9425 2.33083C25.9304 2.6922 25.9243 3.11981 25.9243 3.60765V9.21483C25.9243 9.70267 25.9304 10.1303 25.9425 10.4977C25.9608 10.859 25.9791 11.1722 25.9974 11.4372C26.0217 11.7022 26.0461 11.9251 26.0766 12.0997C26.1131 12.2804 26.1497 12.425 26.1801 12.5454V12.5816H24.0847V12.5454Z"
      fill="url(#paint0_linear_125_7)"
    />
    <path
      d="M39.3676 11.136C39.3676 11.1963 39.3615 11.2625 39.3433 11.3348C39.3311 11.401 39.3006 11.4613 39.2458 11.5094C38.9839 11.7022 38.6976 11.8829 38.3869 12.0515C38.0824 12.2141 37.7535 12.3526 37.3941 12.4731C37.0347 12.5936 36.6509 12.6839 36.2367 12.7501C35.8286 12.8164 35.384 12.8525 34.9149 12.8525C33.849 12.8525 32.8805 12.702 32.0033 12.3948C31.1262 12.0876 30.3709 11.648 29.7435 11.0879C29.1161 10.5278 28.6349 9.85319 28.2877 9.06421C27.9405 8.26921 27.7699 7.39591 27.7699 6.42624C27.7699 5.87817 27.843 5.34216 27.9831 4.81818C28.1293 4.28818 28.3425 3.78829 28.6166 3.3125C28.8907 2.8367 29.2318 2.39705 29.6338 2.00557C30.0359 1.60205 30.4988 1.25876 31.0105 0.963647C31.5282 0.668533 32.1008 0.445688 32.7221 0.283074C33.3495 0.114437 34.0195 0.0361211 34.7444 0.0361211C35.0246 0.0361211 35.3109 0.048171 35.6032 0.0782847C35.8956 0.102376 36.1819 0.138514 36.4682 0.192718C36.7545 0.2409 37.0286 0.295092 37.2905 0.367365C37.5585 0.433615 37.8144 0.511919 38.0519 0.60226L38.6489 2.1983L38.5758 2.23444C38.3504 2.03569 38.0824 1.84899 37.7839 1.67433C37.4854 1.49967 37.1687 1.35509 36.8276 1.22861C36.4865 1.10213 36.1332 1.00578 35.7555 0.933504C35.3901 0.861231 35.0124 0.81907 34.6347 0.81907C33.8977 0.81907 33.2216 0.933507 32.6124 1.16237C31.9972 1.38521 31.4673 1.71647 31.0287 2.14408C30.5902 2.57772 30.2491 3.1017 30.0054 3.72807C29.7618 4.35443 29.6399 5.06511 29.6399 5.86613C29.6399 6.74545 29.7557 7.55852 29.9932 8.31137C30.2247 9.06421 30.5719 9.71466 31.0348 10.2688C31.4978 10.8228 32.0703 11.2565 32.7647 11.5697C33.4591 11.8769 34.2693 12.0334 35.1951 12.0334C35.6032 12.0334 35.9687 12.0033 36.2916 11.9371C36.6144 11.8768 36.8824 11.7985 37.1078 11.7022C37.3271 11.6058 37.4976 11.5034 37.6073 11.395C37.723 11.2806 37.7839 11.1782 37.7839 11.0879V10.7506C37.7839 10.3471 37.7778 10.0038 37.7656 9.70865C37.7534 9.41353 37.7352 9.16057 37.7108 8.94977C37.6864 8.73296 37.6621 8.54626 37.6316 8.38966C37.6012 8.23307 37.5646 8.08855 37.5281 7.96207V7.92594H39.6295V7.96207C39.593 8.08253 39.5565 8.22705 39.526 8.38966C39.4955 8.55228 39.4712 8.74502 39.4468 8.96786C39.4224 9.1907 39.4042 9.45571 39.392 9.76287C39.3798 10.064 39.3737 10.4073 39.3737 10.8048V11.136H39.3676Z"
      fill="url(#paint1_linear_125_7)"
    />
    <path
      d="M41.4508 0.228903L50.478 9.67256V3.60765C50.478 3.11981 50.4719 2.6922 50.4597 2.33083C50.4476 1.96345 50.4293 1.65026 50.4049 1.38526C50.3806 1.11424 50.3501 0.891397 50.3197 0.710715C50.2892 0.530033 50.2587 0.385493 50.2222 0.265038V0.228903H51.7816V0.265038C51.745 0.385493 51.7145 0.536055 51.6841 0.710715C51.6536 0.891397 51.6293 1.11424 51.6049 1.38526C51.5805 1.65026 51.5623 1.96345 51.5501 2.33083C51.5379 2.6922 51.5318 3.11981 51.5318 3.60765V12.7562H51.2272L42.2 3.3246V9.21483C42.2 9.70267 42.2061 10.1303 42.2183 10.4977C42.2305 10.859 42.2488 11.1722 42.2732 11.4372C42.2975 11.7022 42.3219 11.9251 42.3523 12.0997C42.3828 12.2804 42.4132 12.425 42.4498 12.5454V12.5816H40.8904V12.5454C40.927 12.425 40.9574 12.2744 40.9879 12.0997C41.0244 11.9191 41.0549 11.7022 41.0732 11.4372C41.0975 11.1722 41.1158 10.859 41.128 10.4977C41.1402 10.1303 41.1463 9.70267 41.1463 9.21483V3.60765C41.1463 3.11981 41.1402 2.6922 41.128 2.33083C41.1158 1.96345 41.0975 1.65026 41.0732 1.38526C41.0488 1.11424 41.0183 0.891397 40.9879 0.710715C40.9574 0.530033 40.927 0.385493 40.8904 0.265038V0.228903H41.4508Z"
      fill="url(#paint2_linear_125_7)"
    />
    <path
      d="M53.8404 12.5454C53.8769 12.425 53.9074 12.2744 53.9379 12.0997C53.9683 11.9191 53.9927 11.7022 54.017 11.4372C54.0414 11.1722 54.0597 10.859 54.0719 10.4977C54.084 10.1303 54.0901 9.70267 54.0901 9.21483V3.60765C54.0901 3.11981 54.084 2.6922 54.0719 2.33083C54.0597 1.96345 54.0414 1.65026 54.017 1.38526C53.9927 1.11424 53.9683 0.891397 53.9379 0.710715C53.9074 0.530033 53.8769 0.385493 53.8404 0.265038V0.228903H55.9358V0.265038C55.8992 0.385493 55.8627 0.536055 55.8322 0.710715C55.8018 0.891397 55.7774 1.11424 55.753 1.38526C55.7348 1.65026 55.7165 1.96345 55.6982 2.33083C55.686 2.6922 55.6799 3.11981 55.6799 3.60765V9.21483C55.6799 9.70267 55.686 10.1303 55.6982 10.4977C55.7165 10.859 55.7348 11.1722 55.753 11.4372C55.7774 11.7022 55.8018 11.9251 55.8322 12.0997C55.8688 12.2804 55.9053 12.425 55.9358 12.5454V12.5816H53.8404V12.5454Z"
      fill="url(#paint3_linear_125_7)"
    />
    <path
      d="M63.3001 2.19229H63.1052C63.0564 2.05979 62.9833 1.90922 62.8798 1.74661C62.7823 1.57797 62.6483 1.42739 62.4778 1.28285C62.3133 1.13228 62.1123 1.01183 61.8747 0.915469C61.6433 0.819105 61.3631 0.770929 61.0402 0.770929C60.7539 0.770929 60.4981 0.813065 60.2788 0.897383C60.0595 0.981701 59.8707 1.10218 59.7184 1.25877C59.5722 1.41536 59.4626 1.59603 59.3834 1.81285C59.3103 2.02365 59.2677 2.25852 59.2677 2.5175C59.2677 2.93307 59.3834 3.32457 59.621 3.704C59.8585 4.07741 60.157 4.44478 60.5164 4.81217C60.8758 5.17955 61.2595 5.54695 61.6737 5.91434C62.0879 6.28173 62.4717 6.66117 62.8311 7.05868C63.1904 7.45618 63.4828 7.87171 63.7143 8.30535C63.9518 8.73297 64.0737 9.20274 64.0737 9.70263C64.0737 10.076 64.0067 10.4494 63.8727 10.8289C63.7447 11.2023 63.5437 11.5396 63.2696 11.8347C62.9955 12.1358 62.6422 12.3767 62.2097 12.5695C61.7773 12.7562 61.2656 12.8465 60.6687 12.8465C60.3336 12.8465 60.0169 12.8164 59.7123 12.7501C59.4139 12.6899 59.1398 12.6237 58.8778 12.5333C58.6281 12.443 58.3966 12.3466 58.1956 12.2382C57.9946 12.1358 57.8362 12.0395 57.7022 11.9552L57.9032 10.052H58.1225C58.1895 10.323 58.2931 10.582 58.4393 10.8289C58.5855 11.0698 58.7621 11.2866 58.9753 11.4733C59.1885 11.654 59.4382 11.8046 59.7123 11.919C59.9864 12.0274 60.291 12.0816 60.6138 12.0816C60.9123 12.0816 61.1803 12.0395 61.4118 11.9552C61.6493 11.8648 61.8565 11.7383 62.027 11.5817C62.1976 11.4191 62.3255 11.2324 62.4108 11.0156C62.5021 10.7988 62.5508 10.5579 62.5508 10.2989C62.5508 9.93755 62.4839 9.60628 62.3498 9.29912C62.2158 8.99196 62.0392 8.69683 61.8138 8.41978C61.5945 8.14274 61.3509 7.87776 61.0707 7.61879C60.7966 7.35981 60.5103 7.10081 60.2179 6.84183C59.9255 6.57683 59.6392 6.30582 59.359 6.0348C59.0849 5.75776 58.8352 5.46865 58.6159 5.15547C58.4027 4.84228 58.2261 4.50502 58.0921 4.14968C57.9581 3.78832 57.8911 3.39079 57.8911 2.96318C57.8911 2.51147 57.9763 2.10195 58.153 1.74058C58.3357 1.37319 58.5733 1.06001 58.8657 0.801035C59.1641 0.542057 59.4991 0.343313 59.8768 0.204789C60.2484 0.0662664 60.6382 0 61.0341 0C61.3265 0 61.5945 0.0240822 61.8382 0.0662414C62.0818 0.114423 62.3011 0.16864 62.496 0.228867C62.697 0.289095 62.8676 0.355343 63.0138 0.415571C63.16 0.475798 63.2818 0.530009 63.3732 0.572168L63.3001 2.19229Z"
      fill="url(#paint4_linear_125_7)"
    />
    <path
      d="M0 26.6867C0.0365474 26.5663 0.0669965 26.4157 0.0974526 26.235C0.127909 26.0543 0.152277 25.8315 0.176642 25.5665C0.201007 25.3015 0.219278 24.9823 0.23146 24.6149C0.243643 24.2415 0.249733 23.8079 0.249733 23.32V17.6466C0.249733 17.1527 0.243643 16.7251 0.23146 16.3577C0.219278 15.9843 0.201007 15.6651 0.176642 15.4001C0.152277 15.1291 0.127909 14.9002 0.0974526 14.7195C0.0669965 14.5389 0.0365474 14.3883 0 14.2678V14.2317H2.10756V14.2678C2.07101 14.3883 2.03447 14.5389 2.00401 14.7195C1.97355 14.9002 1.94919 15.1231 1.92482 15.4001C1.90655 15.6651 1.88828 15.9843 1.87 16.3577C1.85782 16.7251 1.85173 17.1527 1.85173 17.6466V23.32C1.85173 23.8139 1.85782 24.2475 1.87 24.6149C1.88828 24.9823 1.90655 25.2955 1.92482 25.5665C1.94919 25.8315 1.97355 26.0543 2.00401 26.235C2.04056 26.4157 2.0771 26.5663 2.10756 26.6867V26.7229H0V26.6867Z"
      fill="url(#paint5_linear_125_7)"
    />
    <path
      d="M3.6182 26.6867C3.6852 26.5964 3.75829 26.4579 3.83748 26.2772C3.91667 26.0905 3.98366 25.8616 4.03239 25.5786C4.0994 25.175 4.16641 24.7173 4.24559 24.2114C4.32478 23.6995 4.41005 23.1634 4.48924 22.6093C4.57451 22.0492 4.65979 21.4831 4.74507 20.9049C4.83034 20.3207 4.91563 19.7425 4.98872 19.1824C5.06791 18.6103 5.14709 18.0682 5.22018 17.5442C5.29937 17.0142 5.36637 16.5324 5.42119 16.0987C5.48211 15.6651 5.52474 15.2857 5.56129 14.9665C5.60393 14.6413 5.63438 14.3943 5.64657 14.2317H6.76736L12.3104 24.4764L17.8108 14.2317H18.6453L20.0889 24.5788C20.1315 24.904 20.1742 25.1811 20.2229 25.4159C20.2716 25.6508 20.3143 25.8496 20.363 26.0182C20.4117 26.1808 20.4544 26.3193 20.497 26.4278C20.5457 26.5301 20.5884 26.6205 20.631 26.6867V26.7229H18.4138V26.6867C18.4442 26.6205 18.4686 26.5181 18.493 26.3735C18.5234 26.229 18.5356 26.0543 18.5356 25.8496C18.5356 25.7713 18.5356 25.699 18.5295 25.6207C18.5234 25.5424 18.5173 25.4521 18.5052 25.3617L17.3844 17.0142L12.1886 26.6807L11.5794 26.6084L6.34706 16.9239C6.13996 18.3031 5.96331 19.5739 5.81103 20.7363C5.74403 21.2361 5.68312 21.736 5.61612 22.2359C5.54911 22.7298 5.49429 23.1936 5.43947 23.6212C5.39074 24.0488 5.35419 24.4342 5.32373 24.7594C5.29328 25.0847 5.2811 25.3256 5.2811 25.4822C5.2811 25.6809 5.28719 25.8556 5.29937 26.0062C5.31155 26.1567 5.32374 26.2832 5.33592 26.3916C5.35419 26.5121 5.37246 26.6205 5.39074 26.7168H3.63037V26.6867H3.6182Z"
      fill="url(#paint6_linear_125_7)"
    />
    <path
      d="M21.7579 26.6867C21.8249 26.5964 21.898 26.4579 21.9772 26.2772C22.0624 26.0905 22.1234 25.8616 22.1721 25.5786C22.2391 25.175 22.3061 24.7173 22.3853 24.2114C22.4705 23.6995 22.5497 23.1634 22.6289 22.6093C22.7142 22.0492 22.7995 21.4831 22.8847 20.9049C22.97 20.3207 23.0553 19.7425 23.1284 19.1824C23.2137 18.6103 23.2868 18.0682 23.3599 17.5442C23.4391 17.0142 23.5061 16.5324 23.5609 16.0987C23.6157 15.6651 23.6644 15.2857 23.701 14.9665C23.7436 14.6413 23.7741 14.3943 23.7863 14.2317H24.907L30.4501 24.4764L35.9504 14.2317H36.7849L38.2286 24.5788C38.2712 24.904 38.3138 25.1811 38.3626 25.4159C38.4113 25.6508 38.4539 25.8496 38.5027 26.0182C38.5514 26.1808 38.594 26.3193 38.6367 26.4278C38.6854 26.5301 38.7281 26.6205 38.7707 26.6867V26.7229H36.5535V26.6867C36.5839 26.6205 36.6083 26.5181 36.6327 26.3735C36.6631 26.229 36.6753 26.0543 36.6753 25.8496C36.6753 25.7713 36.6753 25.699 36.6692 25.6207C36.6631 25.5424 36.657 25.4521 36.6448 25.3617L35.5241 17.0142L30.3282 26.6807L29.7191 26.6084L24.4867 16.9239C24.2796 18.3031 24.103 19.5739 23.9507 20.7363C23.8837 21.2361 23.8228 21.736 23.7558 22.2359C23.6888 22.7298 23.634 23.1936 23.5792 23.6212C23.5304 24.0488 23.4939 24.4342 23.4634 24.7594C23.433 25.0847 23.4208 25.3256 23.4208 25.4822C23.4208 25.6809 23.4269 25.8556 23.4391 26.0062C23.4512 26.1567 23.4634 26.2832 23.4756 26.3916C23.4939 26.5121 23.5121 26.6205 23.5304 26.7168H21.7701V26.6867H21.7579Z"
      fill="url(#paint7_linear_125_7)"
    />
    <path
      d="M40.2935 14.2317C41.0305 14.2317 41.7554 14.2317 42.4803 14.2257C43.2112 14.2197 43.8751 14.2137 44.4782 14.2076C45.0812 14.1956 45.599 14.1835 46.0314 14.1655C46.4578 14.1474 46.7502 14.1233 46.9025 14.0932L46.47 15.2496C46.2751 15.1954 46.0497 15.1532 45.7939 15.111C45.5685 15.0749 45.3005 15.0448 44.9716 15.0147C44.6548 14.9785 44.2893 14.9605 43.8691 14.9605C43.729 14.9605 43.5584 14.9665 43.3574 14.9785C43.1625 14.9846 42.9736 14.9906 42.7909 15.0026C42.5777 15.0147 42.3645 15.0267 42.1452 15.0388V19.7967C42.7483 19.7907 43.2965 19.7727 43.7838 19.7425C44.2711 19.7124 44.6853 19.6823 45.0264 19.6582C45.4284 19.6221 45.7756 19.5799 46.0862 19.5378L45.8122 20.8025C45.404 20.7483 44.9959 20.7001 44.5695 20.6519C44.2041 20.6098 43.8081 20.5737 43.3817 20.5496C42.9554 20.5134 42.5412 20.4954 42.1513 20.4954V25.958C42.8457 25.958 43.4792 25.9279 44.064 25.8737C44.6426 25.8135 45.1543 25.7472 45.5868 25.6749C46.0923 25.5966 46.5553 25.5003 46.9695 25.3858L46.7136 26.7951C46.6405 26.7891 46.537 26.7831 46.3969 26.7771C46.2568 26.7711 46.0984 26.765 45.9218 26.759C45.7512 26.753 45.5685 26.747 45.3736 26.741C45.1848 26.741 45.0081 26.741 44.8376 26.7349C44.667 26.7349 44.5147 26.7349 44.3807 26.7289C44.2528 26.7289 44.1553 26.7289 44.1005 26.7289H40.2935V26.6928C40.33 26.5723 40.3605 26.4218 40.3909 26.2411C40.4275 26.0604 40.458 25.8376 40.4762 25.5726C40.5006 25.3076 40.5189 24.9883 40.531 24.6209C40.5432 24.2475 40.5493 23.8139 40.5493 23.326V17.6526C40.5493 17.1588 40.5432 16.7311 40.531 16.3638C40.5189 15.9903 40.5006 15.6712 40.4762 15.4062C40.4519 15.1351 40.4214 14.9063 40.3909 14.7256C40.3605 14.5449 40.33 14.3943 40.2935 14.2739V14.2317Z"
      fill="url(#paint8_linear_125_7)"
    />
    <path
      d="M49.2781 14.2317L58.354 23.7778V17.6466C58.354 17.1528 58.3479 16.7252 58.3357 16.3578C58.3235 15.9844 58.3053 15.6652 58.2809 15.4002C58.2565 15.1291 58.2261 14.9003 58.1956 14.7196C58.1652 14.5389 58.1347 14.3883 58.0982 14.2679V14.2317H59.6636V14.2679C59.6271 14.3883 59.5966 14.5389 59.5661 14.7196C59.5357 14.9003 59.5113 15.1231 59.487 15.4002C59.4626 15.6652 59.4443 15.9844 59.4321 16.3578C59.42 16.7252 59.4139 17.1528 59.4139 17.6466V26.8976H59.1032L50.0273 17.3575V23.3141C50.0273 23.8079 50.0334 24.2415 50.0455 24.6089C50.0577 24.9763 50.076 25.2895 50.1004 25.5605C50.1247 25.8255 50.1491 26.0484 50.1796 26.229C50.21 26.4097 50.2405 26.5603 50.277 26.6807V26.7169H48.7116V26.6807C48.7481 26.5603 48.7786 26.4097 48.809 26.229C48.8456 26.0484 48.876 25.8255 48.8943 25.5605C48.9187 25.2955 48.937 24.9763 48.9491 24.6089C48.9613 24.2355 48.9674 23.8019 48.9674 23.3141V17.6406C48.9674 17.1467 48.9613 16.7191 48.9491 16.3518C48.937 15.9784 48.9187 15.6591 48.8943 15.3941C48.87 15.1231 48.8395 14.8942 48.809 14.7136C48.7786 14.5329 48.7481 14.3823 48.7116 14.2618V14.2257H49.2781V14.2317Z"
      fill="url(#paint9_linear_125_7)"
    />
    <path
      d="M67.034 16.2193H66.8391C66.7903 16.0868 66.7172 15.9362 66.6076 15.7676C66.5101 15.5989 66.3701 15.4424 66.1995 15.2978C66.035 15.1472 65.834 15.0208 65.5904 14.9244C65.3528 14.828 65.0787 14.7738 64.7559 14.7738C64.4696 14.7738 64.2138 14.816 63.9884 14.9063C63.763 14.9906 63.5803 15.1171 63.4219 15.2737C63.2757 15.4303 63.1661 15.617 63.0869 15.8338C63.0077 16.0506 62.9711 16.2855 62.9711 16.5505C62.9711 16.9661 63.0869 17.3696 63.3244 17.7551C63.5681 18.1345 63.8665 18.5079 64.2259 18.8814C64.5853 19.2548 64.9691 19.6221 65.3894 19.9955C65.8036 20.369 66.1934 20.7544 66.5528 21.1519C66.9122 21.5554 67.2106 21.971 67.4421 22.4167C67.6857 22.8503 67.8015 23.3201 67.8015 23.826C67.8015 24.2054 67.7345 24.5849 67.6005 24.9643C67.4726 25.3437 67.2716 25.681 66.9914 25.9822C66.7172 26.2833 66.3579 26.5302 65.9254 26.7229C65.4929 26.9096 64.9752 27 64.3721 27C64.0371 27 63.7143 26.9699 63.4097 26.9036C63.1112 26.8434 62.831 26.7711 62.5752 26.6868C62.3255 26.5965 62.094 26.4941 61.8869 26.3917C61.6859 26.2893 61.5214 26.193 61.3935 26.1026L61.5945 24.1753H61.8138C61.8808 24.4464 61.9844 24.7113 62.1305 24.9583C62.2767 25.1992 62.4595 25.422 62.6666 25.6087C62.8859 25.7955 63.1295 25.946 63.4036 26.0605C63.6777 26.1689 63.9823 26.223 64.3112 26.223C64.6097 26.223 64.8777 26.1809 65.1153 26.0906C65.3589 26.0002 65.5599 25.8737 65.7305 25.7172C65.901 25.5545 66.0289 25.3618 66.1203 25.145C66.2117 24.9221 66.2604 24.6812 66.2604 24.4222C66.2604 24.0549 66.1934 23.7176 66.0594 23.4104C65.9254 23.0972 65.7427 22.8021 65.5234 22.5191C65.3041 22.242 65.0543 21.971 64.7741 21.712C64.5 21.453 64.2137 21.188 63.9214 20.9291C63.629 20.6641 63.3427 20.387 63.0564 20.11C62.7823 19.8329 62.5326 19.5378 62.3072 19.2186C62.0879 18.8994 61.9113 18.5621 61.7773 18.2008C61.6433 17.8334 61.5762 17.4359 61.5762 16.9962C61.5762 16.5385 61.6615 16.1229 61.8382 15.7615C62.0209 15.3881 62.2585 15.075 62.5508 14.81C62.8493 14.551 63.1904 14.3462 63.562 14.2077C63.9396 14.0692 64.3234 13.9969 64.7254 13.9969C65.0178 13.9969 65.2919 14.021 65.5355 14.0692C65.7853 14.1173 66.0046 14.1715 66.1934 14.2318C66.3944 14.298 66.565 14.3583 66.7112 14.4245C66.8574 14.4908 66.9792 14.5389 67.0705 14.5811L67.034 16.2193Z"
      fill="url(#paint10_linear_125_7)"
    />
    <path
      d="M78.7352 17.6466C78.7352 17.1527 78.7292 16.7251 78.717 16.3577C78.7048 15.9843 78.6865 15.6651 78.6622 15.4001C78.6378 15.1291 78.6134 14.9002 78.583 14.7195C78.5525 14.5389 78.5221 14.3883 78.4855 14.2678V14.2317H80.051V14.2678C80.0144 14.3883 79.9779 14.5389 79.9474 14.7195C79.9169 14.9002 79.8926 15.1231 79.8682 15.4001C79.85 15.6651 79.8317 15.9843 79.8134 16.3577C79.8012 16.7251 79.7951 17.1527 79.7951 17.6466V22.3503C79.7951 23.1815 79.6733 23.8922 79.4357 24.4764C79.1921 25.0606 78.8571 25.5424 78.4307 25.9218C78.0043 26.2952 77.4865 26.5663 76.8896 26.7349C76.2927 26.9096 75.6348 26.9939 74.9221 26.9939C74.2095 26.9939 73.5455 26.9156 72.9303 26.753C72.3212 26.5904 71.7852 26.3314 71.3283 25.97C70.8776 25.6026 70.5182 25.1329 70.2623 24.5607C70.0065 23.9825 69.8725 23.2718 69.8725 22.4467V17.6586C69.8725 17.1648 69.8664 16.7372 69.8542 16.3698C69.8421 15.9964 69.8238 15.6772 69.7994 15.4122C69.775 15.1411 69.7446 14.9123 69.7141 14.7316C69.6837 14.5509 69.6532 14.4003 69.6167 14.2799V14.2438H71.7303V14.2799C71.6938 14.4003 71.6572 14.5509 71.6268 14.7316C71.5963 14.9123 71.572 15.1351 71.5476 15.4122C71.5232 15.6772 71.505 15.9964 71.4928 16.3698C71.4806 16.7372 71.4745 17.1648 71.4745 17.6586V22.5431C71.4745 23.2357 71.5781 23.8079 71.7852 24.2596C71.9983 24.7053 72.2725 25.0666 72.6136 25.3316C72.9547 25.5906 73.3445 25.7773 73.777 25.8797C74.2095 25.9821 74.6541 26.0363 75.1049 26.0363C75.5556 26.0363 76.0003 25.9821 76.4328 25.8797C76.8652 25.7773 77.2551 25.5906 77.584 25.3316C77.9251 25.0666 78.1992 24.7053 78.4002 24.2596C78.6134 23.8079 78.717 23.2357 78.717 22.5431V17.6466H78.7352Z"
      fill="url(#paint11_linear_125_7)"
    />
    <path
      d="M87.2325 16.2193H87.0376C86.9889 16.0868 86.9158 15.9362 86.8061 15.7676C86.7087 15.5989 86.5686 15.4424 86.398 15.2978C86.2335 15.1472 86.0325 15.0208 85.7889 14.9244C85.5513 14.828 85.2772 14.7738 84.9544 14.7738C84.6681 14.7738 84.4123 14.816 84.1869 14.9063C83.9615 14.9906 83.7788 15.1171 83.6204 15.2737C83.4742 15.4303 83.3646 15.617 83.2854 15.8338C83.2062 16.0506 83.1697 16.2855 83.1697 16.5505C83.1697 16.9661 83.2854 17.3696 83.523 17.7551C83.7666 18.1345 84.0651 18.5079 84.4244 18.8814C84.7838 19.2548 85.1676 19.6221 85.5879 19.9955C86.0021 20.369 86.3919 20.7544 86.7513 21.1519C87.1107 21.5554 87.4092 21.971 87.6406 22.4167C87.8843 22.8503 88 23.3201 88 23.826C88 24.2054 87.933 24.5849 87.799 24.9643C87.6711 25.3437 87.4701 25.681 87.1899 25.9822C86.9158 26.2833 86.5564 26.5302 86.1239 26.7229C85.6914 26.9096 85.1737 27 84.5706 27C84.2356 27 83.9128 26.9699 83.6082 26.9036C83.3098 26.8434 83.0296 26.7711 82.7737 26.6868C82.524 26.5965 82.2925 26.4941 82.0854 26.3917C81.8844 26.2893 81.7199 26.193 81.592 26.1026L81.793 24.1753H82.0123C82.0793 24.4464 82.1829 24.7113 82.3291 24.9583C82.4753 25.1992 82.658 25.422 82.8651 25.6087C83.0844 25.7955 83.328 25.946 83.6082 26.0605C83.8823 26.1689 84.1869 26.223 84.5158 26.223C84.8143 26.223 85.0823 26.1809 85.3199 26.0906C85.5635 26.0002 85.7645 25.8737 85.9351 25.7172C86.1056 25.5545 86.2335 25.3618 86.3249 25.145C86.4163 24.9221 86.465 24.6812 86.465 24.4222C86.465 24.0549 86.398 23.7176 86.264 23.4104C86.13 23.0972 85.9473 22.8021 85.728 22.5191C85.5087 22.242 85.2589 21.971 84.9788 21.712C84.7046 21.453 84.4184 21.188 84.126 20.9291C83.8336 20.6641 83.5473 20.387 83.261 20.11C82.9869 19.8329 82.7372 19.5378 82.5118 19.2186C82.2925 18.8994 82.1159 18.5621 81.9819 18.2008C81.8479 17.8334 81.7809 17.4359 81.7809 16.9962C81.7809 16.5385 81.8661 16.1229 82.0428 15.7615C82.2255 15.3881 82.4631 15.075 82.7555 14.81C83.0539 14.551 83.395 14.3462 83.7666 14.2077C84.1443 14.0692 84.528 13.9969 84.93 13.9969C85.2224 13.9969 85.4965 14.021 85.7402 14.0692C85.9838 14.1173 86.2092 14.1715 86.398 14.2318C86.599 14.298 86.7696 14.3583 86.9158 14.4245C87.0619 14.4908 87.1838 14.5389 87.2751 14.5811L87.2325 16.2193Z"
      fill="url(#paint12_linear_125_7)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint4_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint5_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint6_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint7_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint8_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint9_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint10_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint11_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
      <linearGradient
        id="paint12_linear_125_7"
        x1="28.2965"
        y1="2.33435"
        x2="32.946"
        y2="33.2686"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#ED5500" />
        <stop offset="1" stopColor="#FFA800" />
      </linearGradient>
    </defs>
  </svg>
);
function computeTransitionDuration(
  startZoomLevel: number,
  endZoomLevel: number,
  startFocalPoint: Rect,
  endFocalPoint: Rect,
  maxDuration: number
) {
  // Compute the change in zoom level and the change in focal point
  const deltaZoom = Math.abs(endZoomLevel - startZoomLevel);
  const deltaX = Math.abs(endFocalPoint.left - startFocalPoint.left);
  const deltaY = Math.abs(endFocalPoint.top - startFocalPoint.top);

  // Compute the absolute distance of the change in the focal point
  const focalPointDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Assume that the scrolling speed should be proportional to the zoom level
  // Therefore, the total scroll distance should be multiplied by the average zoom level during the transition
  const averageZoomLevel = (startZoomLevel + endZoomLevel) / 2;
  const zoomAdjustedScrollDistance = focalPointDistance * averageZoomLevel;

  // The total "distance" of the transition is the sum of the change in zoom and the zoom-adjusted change in focal point
  const totalDistance = deltaZoom + zoomAdjustedScrollDistance;

  // The duration should be proportional to the total distance, up to a maximum duration
  const duration = Math.min(totalDistance * maxDuration, maxDuration);

  return duration;
}

function drawOctagon(x: number, y: number, radius: number, vertex = 2) {
  const octagonPoints = [];
  const angleIncrement = (2 * Math.PI) / 8;

  for (let i = 0; i < 8; i++) {
    const angle = i * angleIncrement;
    octagonPoints.push([
      x + radius * Math.cos(angle),
      y + radius * Math.sin(angle),
    ]);
  }
  octagonPoints[vertex][1] -=
    (octagonPoints[vertex][1] - octagonPoints[vertex + 1][1]) * 2;

  const path = `M${octagonPoints.join("L")}Z`;

  return path;
}
export default function Slider() {
  const [isLoaded, setLoaded] = useState(false);

  const getSize = () => ({
    width: typeof window == "undefined" ? 1000 : window.innerWidth,
    height: typeof window == "undefined" ? 600 : window.innerHeight,
  });
  const [{ width, height }, setSize] = useState(getSize);
  const rect = { top: 0, left: 0, width, height };
  useEffect(() => {
    setSize(getSize);
    window.addEventListener("resize", () => {
      setSize(getSize);
    });
  }, []);

  const fullscreen = `M0,0 L${width},0 L${width},${height} L0,${height} L0,0`;

  const isMobile = width < 600;
  const tileRadius = Math.min(width, height) / (isMobile ? 2.75 : 3.5) / 2;
  const stroke = tileRadius / 20;
  const octagonRaw = roundCorners(
    drawOctagon(1, 1, tileRadius - stroke),
    tileRadius / 7
  ).path;
  const octagon =
    new SVGPathCommander(octagonRaw)
      .transform({
        translate: [-1, -1],
      })
      .toString() +
    `M -${tileRadius},-${tileRadius} M${tileRadius},${tileRadius}`;

  const shiftAligned =
    tileRadius * Math.sin(((2 * Math.PI) / 8) * 2) -
    tileRadius * Math.sin(((2 * Math.PI) / 8) * 3);
  const shiftDiagonally = (85.3 / 50) * tileRadius;

  const focusX = isMobile ? width / 2 : width - tileRadius * 1.7;
  const focusY = height - tileRadius * 1.6;

  const getPositionPath = (position: Position, scale = 1) => {
    return new SVGPathCommander(octagon)
      .transform({
        translate: [position.left, position.top],
        rotate: position.angle,
        scale: scale,
        //scale: position.className == "logo" ? 1.01 : 1,
      })
      .toString();
  };

  const positions: Position[] = useMemo(
    () =>
      [
        (!isMobile &&
          ({
            left: focusX - shiftDiagonally,
            top: focusY + shiftDiagonally - tileRadius,
            angle: -45,
            titleAngle: -22.5 + 45,
          } as Position)) ||
          undefined,
        {
          left: focusX - shiftDiagonally,
          top: focusY + tileRadius - shiftDiagonally,
          angle: 0,
          titleAngle: -22.5,
        } as Position,
        {
          left: focusX - shiftDiagonally + tileRadius,
          top: focusY - shiftDiagonally,
          angle: 45,
          titleAngle: -22.5 - 45,
        } as Position,
        {
          left: focusX + shiftDiagonally - tileRadius,
          top: focusY - shiftDiagonally,
          angle: 90,
          titleAngle: -22.5 - (isMobile ? 45 : 90),
        } as Position,
        (isMobile &&
          ({
            left: focusX + shiftDiagonally,
            top: focusY + tileRadius - shiftDiagonally,
            angle: 135,
            titleAngle: -22.5 - 90,
          } as Position)) ||
          undefined,
      ]
        .flatMap((position) => {
          if (position == null) return [];
          const path = getPositionPath(position);
          return {
            ...position,
            path: path,
            expandedPath: interpolate(path, fullscreen, {
              maxSegmentLength: 5,
            })(0.0001).toString(),
          };
        })
        .reverse(),
    [width, height]
  );

  const logoPosition = {
    left: focusX,
    top: focusY,
    angle: 0,
  } as Position;

  const centerPosition = isMobile
    ? ({
        left: width / 2,
        top: 0 + tileRadius + height / 4,
        angle: 0,
      } as Position)
    : ({
        left: width / 4,
        top: height / 2,
        angle: 0,
      } as Position);
  centerPosition.path = getPositionPath(centerPosition, 1.5);
  centerPosition.expandedPath = interpolate(centerPosition.path, fullscreen, {
    maxSegmentLength: 5,
  })(0.001).toString();
  const logoRotation = useRef(0);

  const items: Item[] = useMemo(
    () => [
      {
        image: "/frame.jpg",

        rect: { left: 0, top: 0, width: 4000, height: 6000 },
        focus: { left: 1000, top: 1000, width: 1000, height: 1000 },
        title: "Us",
        className: "about",
      },
      {
        image: "/fragrances.jpg",
        rect: { left: 0, top: 0, width: 2600, height: 1500 },
        focus: { left: 756, top: 0, width: 857, height: 857 },
        focusLarge: { left: 756, top: 447, width: 467, height: 467 },
        title: "Oils",
        className: "fragrances",
      },
      {
        image: "/accessories.jpg",
        rect: { left: 0, top: 0, width: 2560, height: 1707 },
        focus: { left: 260, top: 150, width: 1000, height: 1000 },
        focusLarge: { left: 333, top: 447, width: 580, height: 580 },
        title: "Tools",
        className: "accessories",
      },
      {
        image: "/delivery.jpg",
        rect: { left: 0, top: 0, width: 2600, height: 2600 },
        focus: { left: 333, top: 350, width: 1600, height: 1600 },
        focusLarge: { left: 585, top: 903, width: 700, height: 700 },
        title: "Refill",
        className: "about",
      },
      //{
      //  image: "/candle2.jpg",
      //  rect: { left: 0, top: 0, width: 2500, height: 1865 },
      //  focus: { left: 350, top: 770, width: 600, height: 600 },
      //  focusLarge: { left: 0, top: 470, width: 1000, height: 1000 },
      //  title: "Jars",
      //  className: "candles",
      //},
      //{
      //  image: "/candle3.jpg",
      //  rect: { left: 0, top: 0, width: 2500, height: 1865 },
      //  focus: { left: 350, top: 770, width: 600, height: 600 },
      //  focusLarge: { left: 400, top: 670, width: 800, height: 800 },
      //  title: "Jars",
      //  className: "candles",
      //},
      /*{
        image: "/candle4.front.png",
        rect: { left: 0, top: 0, width: 2843, height: 1513 },
        focus: { left: 350, top: 770, width: 600, height: 600 },
        focusLarge: { left: 400, top: 0, width: 1200, height: 1200 },
        title: "Jars",
        className: "candles",
      },*/
      //{
      //  image: "/candle4.back.jpg",
      //  rect: { left: 0, top: 0, width: 4705, height: 3605 },
      //  focus: { left: 350, top: 770, width: 600, height: 600 },
      //  focusLarge: { left: 400, top: 1000, width: 1400, height: 1400 },
      //  title: "Jars",
      //  className: "candles",
      //},
      {
        image: "/candle6.jpg",
        rect: { left: 0, top: 0, width: 4705, height: 3605 },
        focus: { left: 1250, top: 1670, width: 1500, height: 1500 },
        focusLarge: { left: 800, top: 1000, width: 1500, height: 1500 },
        title: "Jars",
        className: "candles",
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const lastIndex = useRef(-1);
  const lastItems = useRef(items);
  const lastActiveIndex = lastIndex.current;
  const orderedItems = useMemo(() => {
    if (lastActiveIndex == -1) return lastItems.current;
    const lastActiveItem = items[lastIndex.current];
    return (lastItems.current = lastItems.current
      .filter((i) => i != lastActiveItem)
      .concat(lastActiveItem));
  }, [activeIndex]);
  lastIndex.current = activeIndex;
  const fullscreenExpanded = useMemo(
    () =>
      interpolate(positions[0].expandedPath, fullscreen, {
        maxSegmentLength: 5,
      })(0.999).toString(),
    []
  );

  function getPositionFrame(position: Position | undefined) {
    if (!position) {
      return {
        //backgroundSize: "cover",
        clipPath: fullscreenExpanded,
        titleTransform: "translate(50px, 50px)",
      };
    }
    return {
      // backgroundSize: "cover",
      clipPath: position.expandedPath,
      titleTransform: `
      translate(${position.left}px, ${position.top}px)
      translate(-50%, -50%)
      rotateZ(${position.angle + position.titleAngle}deg)
      translate(50%, 50%)
      translate(${
        -tileRadius / 2.5 +
        (position.titleAngle == -22.5 - 90 ? tileRadius * 0 : 0)
      }px, ${-tileRadius * 1.35}px)
      translate(0%, 50%)
      translate(-50%, -50%)
      scale(${isMobile ? "50%" : "50%"})
      translate(50%, 50%)
      translate(-${tileRadius * 0.15}px, 0)
      `,
    };
  }

  const setLayout = () => {
    const slides = Array.from(
      document.querySelectorAll("[slide-index]")
    ) as HTMLElement[];
    const lastSlide = document.querySelector(
      `[slide-index="${lastActiveIndex}"]`
    ) as HTMLElement;
    const activeSlide = document.querySelector(
      `[slide-index="${activeIndex}"]`
    ) as HTMLElement;

    var used = 0;
    var mid: (() => void)[] = [];
    var end: (() => void)[] = [];
    setTimeout(
      () => {
        mid.forEach((fn) => fn());
      },
      isLoaded ? 900 : 0
    );
    setTimeout(
      () => {
        end.forEach((fn) => fn());
      },
      isLoaded ? 1700 : 0
    );

    for (const slide of slides) {
      const index = parseInt(slide.getAttribute("slide-index") as string);
      const item = items[index];
      const { image, title } = item;
      const positionIndex = activeIndex == index ? null : used++;
      const position =
        positionIndex == null ? undefined : positions[positionIndex];
      item.position = position;
      const frame = getPositionFrame(position);
      const { clipPath, titleTransform } = frame;
      const imageElement = slide.firstElementChild as HTMLElement;
      const titleElement = slide.lastElementChild as HTMLElement;
      if (slide == lastSlide) {
        if (!position) continue;
        slide.style.zIndex = "1";
        titleElement.style.transition = "opacity .3s";
        requestAnimationFrame(() => {
          titleElement.style.opacity = "0";
        });
        end.push(() => {
          imageElement.style.transition = "";
          titleElement.style.transition = "";
          titleElement.style.transform = titleTransform;
          imageElement.style.clipPath = `path("${clipPath}")`;
          Object.assign(
            imageElement.style,
            computeZoom(item.rect, item.focus, rect, {
              left: position.left - tileRadius,
              top: position.top - tileRadius,
              width: tileRadius * 2,
              height: tileRadius * 2,
            })
          );
          lastSlide.style.transition = "";
          lastSlide.style.opacity = "0";
          const x = width / 2 - logoPosition.left;
          const y = height / 2 - logoPosition.top;
          lastSlide.style.transform = `translate(${-x}px, ${-y}px) rotate(-70deg) translate(${x}px, ${y}px) `;
          lastSlide.style.zIndex = "3";
          requestAnimationFrame(() => {
            lastSlide.style.opacity = "1";
            slide.classList.add("slide-inactive");
            titleElement.style.opacity = "1";
            imageElement.style.transition = "clip-path .3s";
            imageElement.style.clipPath = `path("${clipPath}")`;
            lastSlide.style.transition =
              "transform 0.9s cubic-bezier(.02, .99, .69, 1), opacity 0.6s .2s ease-out";
            lastSlide.style.transform = `translate(${-x}px, ${-y}px) rotate(0) translate(${x}px, ${y}px) `;
            titleElement.style.transition = "opacity 0.9s transform .9s";
          });
        });
      } else if (slide == activeSlide) {
        imageElement.style.clipPath = `path("${centerPosition.expandedPath}")`;
        imageElement.style.transition = "clip-path .3s";
        titleElement.style.transition = "transform .3s ease-in-out";
        titleElement.style.transform = `translate(-50%, -150%) translate(${
          centerPosition.left
        }px, ${centerPosition.top - tileRadius * 1.25}px)`;

        Object.assign(
          imageElement.style,
          computeZoom(item.rect, item.focusLarge || item.focus, rect, {
            left: centerPosition.left - width / 6,
            top: centerPosition.top - width / 6,
            width: width / 3,
            height: height / 3,
          })
        );
        slide.classList.remove("slide-inactive");
        mid.push(() => {
          imageElement.style.clipPath = `path("${clipPath}")`;
          imageElement.style.transition =
            "background-size 1.5s, clip-path .8s, background-position 1.4s";
          titleElement.style.transform = titleTransform;
          titleElement.style.transition = "transform .8s ease-out";
          slide.style.zIndex = "2";
        });
        end.push(() => {
          logoRotation.current += 45;
          const logo = document.querySelector("#logo") as HTMLElement;
          logo.style.transition = "0.8s transform";
          logo.style.transform = `rotateZ(${logoRotation.current}deg)`;
        });
      } else {
        end.push(() => {
          slide.classList.add("slide-inactive");
          imageElement.style.clipPath = `path("${clipPath}")`;
          imageElement.style.transition =
            "clip-path .8s,background-size .8s, background-position .8s";
          titleElement.style.transform = titleTransform;
          titleElement.style.transition = "transform .9s";
          slide.style.zIndex = "3";
          Object.assign(
            imageElement.style,
            computeZoom(item.rect, item.focus, rect, {
              left: position!.left - tileRadius,
              top: position!.top - tileRadius,
              width: tileRadius * 2,
              height: tileRadius * 2,
            })
          );
          Object.assign(
            titleElement.style,
            computeZoom(item.rect, item.focus, rect, {
              left: position!.left - tileRadius,
              top: position!.top - tileRadius,
              width: tileRadius * 2,
              height: tileRadius * 2,
            })
          );
        });
      }
    }
  };
  useEffect(setLayout, [activeIndex, width, height]);

  const lastClick = useRef(new Date(Number(new Date()) - 2000));

  return (
    <div
      id="slider"
      style={{
        height: "100%",
        width: "100%",
        background: "#111",
        overflow: "hidden",
        position: "absolute",
      }}
    >
      {!isLoaded && (
        <style>
          $
          {`
        #slider * {
          transition: none !important
        }
        `}
        </style>
      )}
      {orderedItems.map((item) => {
        const index = items.indexOf(item);
        const { image, title } = item;
        return (
          <div
            key={title}
            slide-index={index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: "100%",
              pointerEvents: "none",
              backgroundRepeat: "no-repeat",
            }}
            className="slide "
          >
            <div
              onClick={(e) => {
                if (Number(new Date()) - Number(lastClick.current) > 2000) {
                  lastClick.current = new Date();
                  setLoaded(true);
                  setActiveIndex(index);
                }
              }}
              style={{
                /*@ts-ignore */
                backgroundImage: `url("${image}")`,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "all",
              }}
            ></div>
            <h2
              style={{
                fontSize: tileRadius,
                width: tileRadius * 2 + "px",
                textAlign: "center",
              }}
            >
              {title.toLowerCase()}
            </h2>
          </div>
        );
      })}

      <div
        className="backdrop"
        style={{
          background: `radial-gradient(40.00% 40.00% at ${focusX}px ${focusY}px,rgba(0, 0, 0, 0.85) 0%,  rgba(0, 0, 0, 0.7) 32.06%, rgba(74, 52, 52, 0) 100%)`,
        }}
      ></div>
      <div
        style={{
          zIndex: 5,
          transform: "rotateZ(360deg)",
          position: "absolute",
          left: focusX - tileRadius,
          top: focusY - tileRadius,
          height: tileRadius * 2,
          width: tileRadius * 2,
        }}
      >
        <svg
          viewBox={`0 0 ${tileRadius * 2} ${tileRadius * 2}`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1,
          }}
        >
          <defs>
            <linearGradient
              id="orange"
              x1="28.2965%"
              y1="2.33435%"
              x2="32.946%"
              y2="33.2686%"
            >
              <stop stopColor="#ED5500" />
              <stop offset="1" stopColor="#FFA800" />
            </linearGradient>
          </defs>
          <path
            d={getPositionPath(
              {
                left: 0,
                top: 0,
                path: octagon,
                angle: 0,
                titleAngle: 0,
              },
              1.023
            )}
            fill={`url("#orange")`}
            transform={`translate(${tileRadius},${tileRadius})`}
          />
        </svg>
        <div
          id="logo"
          style={{
            transform: `rotateZ(${logoRotation.current}deg)`,
          }}
        >
          {logo}
        </div>
        {title}
      </div>
    </div>
  );
}
