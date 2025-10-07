import React from "react";
import {
  CURRENCIES,
  CurrencyCode,
  useCurrency,
} from "../../../../context/CurrencyContext";
import {
  CoinLeftSidebarContainer,
  StatsGrid,
  StatBox,
  StatLabel,
  StatValue,
  SupplyWrapper,
  LinksWrapper,
  SectionTitle,
  MarketStats,
  SupplyInfo,
  Links,
  Explorers,
  Wallets,
  UCID,
  CoinIcon,
  CoinInfo,
  PriceSection,
  PriceHeader,
  PriceWrapper,
  FaqQuestion,
  CirculatingSupply,
  LinksRow,
  LinksTitle,
  Link,
  LinkIcon,
  LinkText,
  CoinConverter,
  ConverterTitle,
  InputField,
  CoinConvertInputs,
  CurrencyLabel,
  CoinBasicInfo,
  NameTickerContainer,
  CoinConverterCard,
  CoinConverterCardTitle,
  CoinConverterContainer,
  ConvertInput,
  SwapButton,
  CoinConvertInputsWrapper,
} from "./CoinLeftSidebar.styled";
import PriceDisplay from "components/PriceDisplay/PriceDisplay";
import PercentageChange from "components/PercentageChange/PercentageChange";
import type { IconType } from "react-icons";
import {
  FaGlobe,
  FaTelegram,
  FaDiscord,
  FaGithub,
  FaReddit,
  FaFacebook,
  FaChevronDown,
  FaCopy,
  FaExternalLinkAlt,
  FaInfinity,
  FaInfoCircle,
} from "react-icons/fa";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { useTheme } from "styled-components";

import { FaXTwitter } from "react-icons/fa6";
import { MdSwapVert } from "react-icons/md";
import styled from "styled-components";
import toast from "react-hot-toast";
import CurrencySelector from "components/CurrencySelector/CurrencySelector";
import CryptoSelector from "components/CryptoSelector/CryptoSelector";
import { generateTokenUrl } from "utils/url";
import CustomLink from "components/CustomLink/CustomLink";

interface coin {
  id: string;
  ticker: string;
  cmdId: string;
  name: string;
  slug: string;
  rank?: number;
  currentPrice: {
    usd: number;
    lastUpdated: Date;
  };
  marketData: {
    marketCap?: number;
    fdv?: number;
    volume24h?: number;
    totalSupply?: number;
    circulatingSupply?: number;
    maxSupply?: number;
  };
  networkAddresses: {
    networkType: {
      name: string;
      network: string;
    };
    address: string;
  }[];
  categories: {
    category: {
      name: string;
      description: string;
    };
  }[];
  socials: {
    website: string[];
    twitter: string[];
    telegram: string[];
    discord: string[];
    github: string[];
    explorer: string[];
    facebook: string[];
    reddit: string[];
  };
  description?: string;
  cmcId?: string;
  cmcSlug?: string;
  priceChanges: {
    hour1?: number;
    day1?: number;
    month1?: number;
    year1?: number;
    lastUpdated: Date;
  };
  history: {
    timestamp: Date;
    price: number;
    marketCap?: number;
    volume?: number;
  }[];
}

interface CoinLeftSidebarProps {
  coin: coin;
  isSticky: boolean;
  loading: boolean;
}

const formatNumber = (num: number) => {
  if (num <= 0) return null; // Return null for zero or negative values to handle with infinity icon
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num?.toFixed(2);
};

const Icon = ({
  icon: IconComponent,
  ...props
}: { icon: IconType | string } & React.ComponentProps<any>) => {
  // If icon is a string, return null or a fallback icon
  if (typeof IconComponent === "string") {
    console.warn(
      `Icon component received string instead of component: ${IconComponent}`
    );
    return null;
  }
  return <IconComponent {...props} />;
};

const ColoredIcon = styled(Icon)<{ color: string }>`
  color: ${(props) => props.color};
  transition: all 0.2s ease;
  &:hover {
    opacity: 0.8;
  }
`;

const SocialLink = styled(Link)`
  position: relative;
  padding: 3px;
  border-radius: 20px;
  background: ${(props) => props.theme.colors.colorLightNeutral2};
  &:hover {
    background: ${(props) =>
      props.theme.name === "dark" ? "white" : "rgba(0, 0, 0, 0.05)"};
    .social-name {
      display: block;
    }
  }
`;

const SocialName = styled.span`
  display: none;
  position: absolute;
  bottom: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  white-space: nowrap;
  background: ${(props) =>
    props.theme.name === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.05)"};
  padding: 4px 8px;
  border-radius: 4px;
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${(props) => props.theme.colors.colorLightNeutral2};
  max-width: 300px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  z-index: 1002;
  padding: 8px 0;
  max-height: 300px;
  overflow-y: auto;
  font-size: 12px;
  border: 1px solid ${(props) => props.theme.colors.borderColor};
  transition: opacity 0.2s ease, transform 0.2s ease;
  transform-origin: top right;

  /* Keep dropdown visible when hovering over it */
  &:hover {
    display: block;
  }
`;

const ExplorerDropdown = styled.div`
  position: relative;
  display: inline-block;
  z-index: 1001;

  &:hover ${DropdownContent}, &.active ${DropdownContent} {
    display: block;
    animation: fadeIn 0.2s ease-in-out forwards;
  }

  /* Create a pseudo-element to bridge the gap between the link and dropdown */
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 10px; /* Height of the bridge */
    background: transparent;
    z-index: 1001;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const DropdownLink = styled.a`
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  color: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
  pointer-events: all;
  width: 100%;
  box-sizing: border-box;
  border-bottom: 1px solid ${(props) => props.theme.colors.borderColor};

  &:last-child {
    border-bottom: none;
  }

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    padding-right: 16px;
  }

  &:hover {
    background: ${(props) =>
      props.theme.name === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.05)"};
  }
`;

const CopyIconWrapper = styled.div`
  cursor: pointer;
  margin-left: 8px;
  opacity: 0.6;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

const CopyMessage = styled.span`
  position: absolute;
  bottom: -24px;
  right: 0;
  background: ${(props) => props.theme.colors.colorLightNeutral2};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  animation: fadeOut 1.5s forwards;

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;

const DropdownIndicator = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  width: 16px;
  height: 16px;
  background: ${(props) => props.theme.colors.colorLightNeutral2};
  border-radius: 50%;
  padding: 2px;
  transition: all 0.2s ease;
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);

  &:hover {
    background: ${(props) => props.theme.colors.colorLightNeutral3};
  }
`;

export const CoinNameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
`;

export const CoinNameSection = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const CurrencySelectorWrapper = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: 600;
  position: relative;
  z-index: 1010;

  /* Style the currency selector container */
  > div {
    background: ${(props) => props.theme.colors.colorLightNeutral2};
    border-radius: 8px;
    padding: 6px 14px;
    transition: all 0.2s ease;
    position: relative;

    &:hover {
      background: ${(props) => props.theme.colors.colorLightNeutral3};
    }
  }

  /* Style the select container */
  .select__control {
    font-size: 24px;
    font-weight: 600;
  }

  /* Style the dropdown menu */
  .select__menu {
    position: absolute;
    right: 0;
    min-width: 150px;
    background: ${(props) => props.theme.colors.colorLightNeutral2};
    border: 1px solid ${(props) => props.theme.colors.borderColor};
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin-top: 4px;
    z-index: 1011;
  }

  /* Style the dropdown options */
  .select__option {
    padding: 8px 12px;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: ${(props) => props.theme.colors.colorLightNeutral3};
    }

    &--is-selected {
      background: ${(props) => props.theme.colors.colorLightNeutral4};
      font-weight: 600;
    }
  }

  @media screen and (max-width: 1000px) {
    margin-left: auto;
  }

  @media screen and (max-width: 768px) {
    width: 100%;

    > div {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
`;

const CoinTickerWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CoinLeftSidebar = ({ coin, isSticky, loading }: CoinLeftSidebarProps) => {
  const [showCopied, setShowCopied] = React.useState(false);
  const [cryptoAmount, setCryptoAmount] = React.useState("");
  const [currencyAmount, setCurrencyAmount] = React.useState("");
  const [explorerDropdownOpen, setExplorerDropdownOpen] = React.useState(false);
  const explorerDropdownRef = React.useRef<HTMLDivElement>(null);
  const {
    convertPrice,
    formatPrice,
    currency,
    getCurrencySymbol,
    setCurrency,
    rates,
  } = useCurrency();
  const price = coin.currentPrice?.usd || 0;
  const [isSwapped, setIsSwapped] = React.useState(false);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    toast.success("UCID copied to clipboard!", {
      duration: 2000,
      position: "bottom-center",
      style: {
        background: "#333",
        color: "#fff",
        borderRadius: "8px",
      },
    });
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        explorerDropdownRef.current &&
        !explorerDropdownRef.current.contains(event.target as Node)
      ) {
        setExplorerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        explorerDropdownRef.current &&
        !explorerDropdownRef.current.contains(event.target as Node)
      ) {
        setExplorerDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [currency, setCryptoAmount, currencyAmount]);

  const handleCryptoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCryptoAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const usdValue = parseFloat(value) * price;
      const convertedValue = convertPrice(usdValue);
      setCurrencyAmount(convertedValue.toFixed(2));
    } else {
      setCurrencyAmount("");
    }
  };

  const handleChangeAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrencyAmount(value);
    if (value && !isNaN(parseFloat(value))) {
      const valueInUsd = parseFloat(value) / rates[currency];
      setCryptoAmount((valueInUsd / price).toFixed(8));
    } else {
      setCryptoAmount("");
    }
  };

  const handleCurrencyChange = (code: string) => {
    const newCurrency = code as CurrencyCode;
    setCurrency(newCurrency);

    if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
      const usdValue = parseFloat(cryptoAmount) * price;
      const newConvertedValue = usdValue * rates[newCurrency];
      setCurrencyAmount(newConvertedValue.toFixed(2));
    }
  };

  const handleConvert = () => {
    const coinName = coin.name.replace(/\s+/g, "-").toLowerCase();
    const coinTicker = coin.ticker.toLowerCase();
    const fiatCurrencyName = CURRENCIES[currency].name
      .toLowerCase()
      .replace(/\s+/g, "-");
    const fiatCurrencySymbol = CURRENCIES[currency].code.toLowerCase();
    window.open(
      `https://droomdroom.com/converter/${coinName}-${coinTicker}/${fiatCurrencyName}-${fiatCurrencySymbol}`,
      "_blank"
    );
  };

  const getConverterUrl = () => {
    const fiatCurrencyName = CURRENCIES[currency].name.toLowerCase();
    const fiatCurrencySymbol = CURRENCIES[currency].code.toLowerCase();
    return `https://droomdroom.com/converter/${coin.slug}/${generateTokenUrl(fiatCurrencyName, fiatCurrencySymbol)}`;
  };

  const handleSwap = () => {
    // Toggle the swap state
    setIsSwapped(!isSwapped);

    // If we have a value in the first input, calculate the second input's value
    if (!isSwapped) {
      // First input is currency, second is crypto
      if (currencyAmount && !isNaN(parseFloat(currencyAmount))) {
        const valueInUsd = parseFloat(currencyAmount) / rates[currency];
        const newCryptoAmount = (valueInUsd / price).toFixed(8);
        setCryptoAmount(newCryptoAmount);
      }
    } else {
      // First input is crypto, second is currency
      if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
        const usdValue = parseFloat(cryptoAmount) * price;
        const newCurrencyAmount = convertPrice(usdValue).toFixed(2);
        setCurrencyAmount(newCurrencyAmount);
      }
    }
  };

  const scrollToAbout = () => {
    const about = document.getElementById("about");
    if (about) {
      about.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <CoinLeftSidebarContainer isSticky={isSticky}>
      <CoinInfo>
        <CoinBasicInfo>
          <CoinIcon>
            <img
              src={
                coin?.cmcId
                  ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${coin?.cmcId}.png`
                  : "/placeholder.png"
              }
              alt={coin?.name}
            />
          </CoinIcon>
          <NameTickerContainer>
            <span>{coin?.name}</span>
            <span style={{ opacity: "0.6", fontSize: "16px" }}>
              {coin?.ticker}
            </span>
          </NameTickerContainer>
        </CoinBasicInfo>

        <CurrencySelectorWrapper>
          <CurrencySelector small />
        </CurrencySelectorWrapper>
      </CoinInfo>

      <PriceSection style={{ gridArea: "price" }}>
        <PriceHeader>
          <PriceWrapper>
            <PriceDisplay price={coin?.currentPrice?.usd} />
            <PercentageChange
              value={coin?.priceChanges?.day1 || 0}
              filled
              marginLeft={8}
            />
          </PriceWrapper>
          {loading ? (
            <FaqShimmer/>
          ) : (
            <FaqQuestion onClick={scrollToAbout}>
              {coin?.priceChanges?.day1 > 0 ? (
                <TrendingUp
                  size={20}
                  style={{
                    marginRight: "2px",
                    color: "#16c784",
                    transition: "all 0.3s ease-in-out",
                    fontWeight: "bold",
                    width: "20px",
                    height: "20px",
                  }}
                />
              ) : coin?.priceChanges?.day1 < 0 ? (
                <TrendingDown
                  size={20}
                  style={{
                    marginLeft: "2px",
                    color: "#ea3943",
                    transition: "all 0.3s ease-in-out",
                    fontWeight: "bold",
                    width: "20px",
                    height: "20px",
                  }}
                />
              ) : (
                <Clock
                  size={20}
                  style={{
                    marginLeft: "2px",
                    color: "#a855f7",
                    transition: "all 0.3s ease-in-out",
                    fontWeight: "bold",
                    width: "20px",
                    height: "20px",
                  }}
                />
              )}

              <span>
                {coin?.priceChanges?.day1 != null
                  ? coin.priceChanges.day1 > 0
                    ? `Why is ${coin.ticker}'s price up today?`
                    : coin.priceChanges.day1 < 0
                    ? `Why is ${coin.ticker}'s price down today?`
                    : `What could affect ${coin.ticker}'s future price?`
                  : "Price data unavailable"}
              </span>
            </FaqQuestion>
          )}
        </PriceHeader>
      </PriceSection>

      <StatsGrid>
        <StatBox>
          <StatLabel>Market cap</StatLabel>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {(coin?.marketData?.marketCap || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {getCurrencySymbol()}
                {formatNumber(convertPrice(coin?.marketData?.marketCap || 0))}
              </StatValue>
            )}
            <PercentageChange value={coin?.priceChanges?.day1 || 0} />
          </div>
        </StatBox>
        <StatBox>
          <StatLabel>Volume (24h)</StatLabel>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {(coin?.marketData?.volume24h || 0) <= 0 ? (
              <StatValue>
                <Icon icon={FaInfinity} size={16} />
              </StatValue>
            ) : (
              <StatValue>
                {getCurrencySymbol()}
                {formatNumber(convertPrice(coin?.marketData?.volume24h || 0))}
              </StatValue>
            )}
            <PercentageChange
              value={(coin?.marketData as any)?.volumeChange24h || 0}
            />
          </div>
        </StatBox>
        <StatBox>
          <StatLabel>FDV</StatLabel>
          {(coin?.marketData?.fdv || 0) <= 0 ? (
            <StatValue>
              <Icon icon={FaInfinity} size={16} />
            </StatValue>
          ) : (
            <StatValue>
              {getCurrencySymbol()}
              {formatNumber(convertPrice(coin?.marketData?.fdv || 0))}
            </StatValue>
          )}
        </StatBox>
        <StatBox>
          <StatLabel>Vol/Mkt Cap (24h)</StatLabel>
          {(coin?.marketData?.marketCap || 0) <= 0 ? (
            <StatValue>
              <Icon icon={FaInfinity} size={16} />
            </StatValue>
          ) : (
            <StatValue>
              {(
                ((coin?.marketData?.volume24h || 0) /
                  (coin?.marketData?.marketCap || 1)) *
                100
              )?.toFixed(2)}
              %
            </StatValue>
          )}
        </StatBox>
        <StatBox>
          <StatLabel>Total Supply</StatLabel>
          {(coin?.marketData?.totalSupply || 0) <= 0 ? (
            <StatValue>
              <Icon icon={FaInfinity} size={16} />
            </StatValue>
          ) : (
            <StatValue>
              {formatNumber(coin?.marketData?.totalSupply || 0)} {coin?.ticker}
            </StatValue>
          )}
        </StatBox>
        <StatBox>
          <StatLabel>Max Supply</StatLabel>
          {(coin?.marketData?.maxSupply || 0) <= 0 ? (
            <StatValue>
              <Icon icon={FaInfinity} size={16} />
            </StatValue>
          ) : (
            <StatValue>
              {formatNumber(coin?.marketData?.maxSupply || 0)} {coin?.ticker}
            </StatValue>
          )}
        </StatBox>
      </StatsGrid>

      <CirculatingSupply>
        <StatLabel>Circulating Supply</StatLabel>
        {(coin?.marketData?.circulatingSupply || 0) <= 0 ? (
          <StatValue>
            <Icon icon={FaInfinity} size={16} />
          </StatValue>
        ) : (
          <StatValue>
            {formatNumber(coin?.marketData?.circulatingSupply || 0)}{" "}
            {coin?.ticker}
          </StatValue>
        )}
      </CirculatingSupply>

      <LinksWrapper>
        <LinksRow>
          <LinksTitle>Website</LinksTitle>
          <Links>
            {coin?.socials?.website?.[0] && (
              <Link
                href={coin?.socials?.website?.[0]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon>
                  <Icon icon={FaGlobe} size={12} color="currentColor" />
                </LinkIcon>
                <LinkText>
                  {coin?.socials?.website?.[0].replace(/^https?:\/\//, "")}
                </LinkText>
              </Link>
            )}
          </Links>
        </LinksRow>

        <LinksRow>
          <LinksTitle>Socials</LinksTitle>
          <Links>
            {coin?.socials?.twitter?.[0] && (
              <SocialLink
                onClick={() =>
                  window.open(coin?.socials?.twitter?.[0], "_blank")
                }
              >
                <LinkIcon>
                  <ColoredIcon
                    className="icon"
                    icon={FaXTwitter}
                    size={12}
                    color="#1DA1F2"
                  />
                </LinkIcon>
                <SocialName className="social-name">Twitter</SocialName>
              </SocialLink>
            )}
            {coin?.socials?.telegram?.[0] && (
              <SocialLink
                onClick={() =>
                  window.open(coin?.socials?.telegram?.[0], "_blank")
                }
              >
                <LinkIcon>
                  <ColoredIcon
                    className="icon"
                    icon={FaTelegram}
                    size={12}
                    color="#26A5E4"
                  />
                </LinkIcon>
                <SocialName className="social-name">Telegram</SocialName>
              </SocialLink>
            )}
            {coin?.socials?.discord?.[0] && (
              <SocialLink
                onClick={() =>
                  window.open(coin?.socials?.discord?.[0], "_blank")
                }
              >
                <LinkIcon>
                  <ColoredIcon
                    className="icon"
                    icon={FaDiscord}
                    size={12}
                    color="#5865F2"
                  />
                </LinkIcon>
                <SocialName className="social-name">Discord</SocialName>
              </SocialLink>
            )}
            {coin?.socials?.github?.[0] && (
              <SocialLink
                onClick={() =>
                  window.open(coin?.socials?.github?.[0], "_blank")
                }
              >
                <LinkIcon>
                  <ColoredIcon
                    className="icon"
                    icon={FaGithub}
                    size={12}
                    color="#24292E"
                  />
                </LinkIcon>
                <SocialName className="social-name">GitHub</SocialName>
              </SocialLink>
            )}
            {coin?.socials?.reddit?.[0] && (
              <SocialLink
                onClick={() =>
                  window.open(coin?.socials?.reddit?.[0], "_blank")
                }
              >
                <LinkIcon>
                  <ColoredIcon
                    className="icon"
                    icon={FaReddit}
                    size={12}
                    color="#FF4500"
                  />
                </LinkIcon>
                <SocialName className="social-name">Reddit</SocialName>
              </SocialLink>
            )}
            {coin?.socials?.facebook?.[0] && (
              <SocialLink
                onClick={() =>
                  window.open(coin?.socials?.facebook?.[0], "_blank")
                }
              >
                <LinkIcon>
                  <ColoredIcon
                    className="icon"
                    icon={FaFacebook}
                    size={12}
                    color="#1877F2"
                  />
                </LinkIcon>
                <SocialName className="social-name">Facebook</SocialName>
              </SocialLink>
            )}
          </Links>
        </LinksRow>

        <LinksRow>
          <LinksTitle>Explorers</LinksTitle>
          <Links>
            {coin?.socials?.explorer?.length > 0 && (
              <ExplorerDropdown
                className={`explorer-dropdown ${
                  explorerDropdownOpen ? "active" : ""
                }`}
                ref={explorerDropdownRef}
              >
                <Link
                  onClick={(e) => {
                    if (
                      (coin.socials.explorer.length > 1 &&
                        e.target === e.currentTarget) ||
                      (e.target as HTMLElement).closest(".dropdown-indicator")
                    ) {
                      e.stopPropagation();
                      setExplorerDropdownOpen(!explorerDropdownOpen);
                    } else {
                      e.stopPropagation();
                      window.open(coin?.socials?.explorer?.[0], "_blank");
                    }
                  }}
                  title={coin?.socials?.explorer?.[0]}
                  className="explorer-main-link"
                  href=""
                >
                  <LinkIcon>
                    <Icon icon={FaGlobe} size={14} color="currentColor" />
                  </LinkIcon>
                  <LinkText
                    style={{
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {(() => {
                      // Extract domain name from URL
                      const url = coin?.socials?.explorer?.[0];
                      const domain = url
                        ?.replace(/^https?:\/\//, "")
                        .split("/")[0];

                      // Truncate if too long
                      return domain.length > 20
                        ? domain.substring(0, 20) + "..."
                        : domain;
                    })()}
                  </LinkText>
                  {coin?.socials?.explorer?.length > 1 && (
                    <DropdownIndicator className="dropdown-indicator">
                      {explorerDropdownOpen ? (
                        <Icon
                          icon={FaChevronDown}
                          size={10}
                          style={{ transform: "rotate(180deg)" }}
                        />
                      ) : (
                        <Icon icon={FaChevronDown} size={10} />
                      )}
                    </DropdownIndicator>
                  )}
                </Link>
                {coin?.socials?.explorer?.length > 1 && (
                  <DropdownContent onClick={(e) => e.stopPropagation()}>
                    {coin?.socials?.explorer?.map((url, index) => {
                      // Extract domain name from URL
                      const domain = url
                        .replace(/^https?:\/\//, "")
                        .split("/")[0];

                      // Get path for display
                      const path = url.replace(/^https?:\/\/[^\/]+/, "");
                      const displayPath = path.length > 0 ? path : "/";

                      return (
                        <DropdownLink
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title={url}
                        >
                          <Icon
                            icon={FaGlobe}
                            size={12}
                            style={{ marginRight: "8px", flexShrink: 0 }}
                          />
                          <span>
                            <strong>
                              {domain.length > 20
                                ? domain.substring(0, 20) + "..."
                                : domain}
                            </strong>
                            {displayPath !== "/" && (
                              <span
                                style={{
                                  opacity: 0.7,
                                  fontSize: "11px",
                                  display: "block",
                                }}
                              >
                                {displayPath.length > 25
                                  ? displayPath.substring(0, 25) + "..."
                                  : displayPath}
                              </span>
                            )}
                          </span>
                        </DropdownLink>
                      );
                    })}
                  </DropdownContent>
                )}
              </ExplorerDropdown>
            )}
          </Links>
        </LinksRow>
      </LinksWrapper>

      <CoinConverter>
        <h1>
          <ConverterTitle id="converter">
            {coin?.ticker} to Fiat Converter
          </ConverterTitle>
        </h1>
        <CoinConverterContainer>
          <CoinConvertInputsWrapper>
            {isSwapped ? (
              <>
                <ConvertInput>
                  <CryptoSelector
                    selectedCrypto={currency}
                    onSelect={handleCurrencyChange}
                  />
                  <InputField
                    type="number"
                    value={currencyAmount}
                    onChange={handleChangeAmount}
                    placeholder="0.00"
                  />
                </ConvertInput>
                <SwapButton onClick={handleSwap} type="button">
                  <MdSwapVert />
                </SwapButton>
                <ConvertInput>
                  <CurrencyLabel>{coin?.ticker}</CurrencyLabel>
                  <InputField
                    type="number"
                    value={cryptoAmount}
                    onChange={handleCryptoChange}
                    placeholder="0.00"
                  />
                </ConvertInput>
              </>
            ) : (
              <>
                <ConvertInput>
                  <CurrencyLabel>{coin?.ticker}</CurrencyLabel>
                  <InputField
                    type="number"
                    value={cryptoAmount}
                    onChange={handleCryptoChange}
                    placeholder="0.00"
                  />
                </ConvertInput>
                <SwapButton onClick={handleSwap} type="button">
                  <MdSwapVert />
                </SwapButton>
                <ConvertInput>
                  <CryptoSelector
                    selectedCrypto={currency}
                    onSelect={handleCurrencyChange}
                  />
                  <InputField
                    type="number"
                    value={currencyAmount}
                    onChange={handleChangeAmount}
                    placeholder="0.00"
                  />
                </ConvertInput>
              </>
            )}
          </CoinConvertInputsWrapper>
          <CustomLink href={getConverterUrl()} is_a={true}>
            <CoinConverterCard>
              <CoinConverterCardTitle>
                {`Converter for ${coin?.name} (${coin?.ticker}) to Any Currency`}{" "}
                <Icon icon={FaExternalLinkAlt} size={12} color="currentColor" />
              </CoinConverterCardTitle>
            </CoinConverterCard>
          </CustomLink>
        </CoinConverterContainer>
      </CoinConverter>
    </CoinLeftSidebarContainer>
  );
};

export default CoinLeftSidebar;

const FaqShimmer = () => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "80%",
        padding: "0px 2px",
        gap: "12px",
        overflow: "hidden",
      }}
    >
      {[...Array(1)].map((_, index) => (
        <div
          key={index}
          style={{
            flex: index === 4 ? "0 0 100px" : "1",
            height: "25px",
            background:
              theme.name === "dark"
                ? "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)"
                : "linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)",
            borderRadius: "8px",
            animation: "shimmer 1.5s infinite",
            backgroundSize: "200% 100%",
          }}
        />
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};
