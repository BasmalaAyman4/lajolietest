import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "@/hooks/useSidebar";

import {
  MdDashboard,
  MdInventory2,
  MdLocalOffer,
  MdSpa,
  MdLocationOn,
  MdShoppingCart,
  MdSupportAgent,
} from "react-icons/md";

import {
  FaFileAlt,
  FaImage,
  FaBell,
  FaHandshake,
  FaUserTie,
  FaUserCog,
} from "react-icons/fa";

import { FaAngleRight } from "react-icons/fa6";

import Logo from "@/assets/header-logo.png";
import Logosulgn from "@/assets/just-logo.png";

type SubItem = {
  name: string;
  path: string;
};

type NavItem = {
  id: string;
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: SubItem[];
};

const NAV_ITEMS: NavItem[] = [
  {
    id: "overview",
    name: "Overview",
    icon: <MdDashboard />,
    path: "/",
  },

  {
    id: "products",
    name: "Products",
    icon: <MdInventory2 />,
    subItems: [
      { name: "Products", path: "/products" },
      { name: "Category Details", path: "/category" },
      { name: "Sub Category", path: "/subCategory" },
      { name: "Products Bundle", path: "/product-bundles" },
      { name: "Product Type", path: "/productType" },
      { name: "Product Type Detail", path: "/productTypeDetail" },
      { name: "Brand Details", path: "/brand" },
      { name: "Head Color", path: "/headcolor" },
      { name: "Sizes Details", path: "/sizes" },
      { name: "Purchase Details", path: "/purchases" },
      { name: "Barcode Type", path: "/barcodeType" },
      { name: "Stock Tracking", path: "/stock-tracking" },
      { name: "Vendor Details", path: "/vendor" },
      { name: "Store Details", path: "/store" },
      { name: "Branch Details", path: "/branch" },
      { name: "Packaging Details", path: "/packaging" },
      { name: "Beauty Category", path: "/beautyCategory" },
      { name: "Concern", path: "/concern" },
      { name: "Goal", path: "/goal" },
      { name: "Interest", path: "/interest" },
    ],
  },

  {
    id: "offers",
    name: "Offers & Promotions",
    icon: <MdLocalOffer />,
    subItems: [
      { name: "Discount Details", path: "/discount" },
      { name: "Shipping Offer", path: "/shipping-offer" },
      { name: "Voucher Details", path: "/voucher" },
      { name: "Point Options", path: "/point-options" },
    ],
  },

  {
    id: "routine",
    name: "Routine",
    icon: <FaFileAlt />,
    subItems: [
      { name: "Routine Type", path: "/routine-types" },
      { name: "Suggestion Routine", path: "/SuggestionRoutine" },
    ],
  },

  {
    id: "app-option",
    name: "App Option",
    icon: <FaFileAlt />,
    path: "/app-option",
  },

  {
    id: "banner",
    name: "Banner Details",
    icon: <FaImage />,
    path: "/banner",
  },

  {
    id: "reals",
    name: "Reals Details",
    icon: <FaImage />,
   subItems: [
      { name: "Reel Category", path: "/reel-categories" },
      { name: "Reels", path: "/reels" },
    ],
  },

  {
    id: "notification",
    name: "Notification",
    icon: <FaBell />,
    path: "/notification",
  },

  {
    id: "salons",
    name: "Salons",
    icon: <MdSpa />,
    subItems: [
      { name: "Salon Details", path: "/salons" },
      { name: "Salon Service", path: "/service-code" },
      { name: "Salon Discount", path: "/salon-discounts" },
      { name: "Specialist Job", path: "/specialistJob" },
      { name: "Pending Photo", path: "/pending-phaoto" },
     { name: "Service Category", path: "/service-category" },
      { name: "Service Type", path: "/service-type" },
      { name: "Send SMS", path: "/send-sms" },
    ],
  },

  {
    id: "locations",
    name: "Locations",
    icon: <MdLocationOn />,
    subItems: [
      { name: "Country", path: "/country" },
      { name: "City", path: "/city" },
      { name: "Area", path: "/area" },
    ],
  },

  {
    id: "orders",
    name: "Orders",
    icon: <MdShoppingCart />,
    path: "/orders",
  },

  {
    id: "collaboration",
    name: "Collaboration",
    icon: <FaHandshake />,
    subItems: [
      { name: "Collaborator", path: "/collaborator" },
      { name: "Collaborator Voucher", path: "/collaboration-vouchers" },
    ],
  },

  {
    id: "affiliate",
    name: "Affiliate",
    icon: <FaUserTie />,
    subItems: [
      { name: "Affiliate", path: "/affiliate" },
      { name: "Seller", path: "/seller" },
      { name: "Affiliate Request", path: "/affiliate-request" },
    ],
  },

  {
    id: "support",
    name: "Support",
    icon: <MdSupportAgent />,
    subItems: [
      { name: "FAQ Types", path: "/faqType" },
      { name: "FAQ Details", path: "/faq" },
      { name: "Terms Types", path: "/terms-types" },
      { name: "Terms & Conditions", path: "/terms-and-conditions" },
      { name: "Report Issue", path: "/report-issues" },
      { name: "Contact Us", path: "/contact-us" },
      { name: "How To Use", path: "/how-to-use" },
      { name: "Default Image", path: "/default-image" },
      { name: "Startup Media", path: "/startup-media" },
    ],
  },

  {
    id: "manage-users",
    name: "Manage Users",
    icon: <FaUserCog />,
    path: "/manage-user",
  },
];

const AppSidebar: React.FC = () => {
  const location = useLocation();

  const { isExpanded, isHovered, isMobileOpen, setIsHovered } =
    useSidebar();

  const isOpen = isExpanded || isHovered || isMobileOpen;

const [manualOpenId, setManualOpenId] = useState<string | null>(null)
const [manuallyClosed, setManuallyClosed] = useState<string | null>(null)
  const isSubActive = useCallback(
    (path: string) =>
      location.pathname === path ||
      location.pathname.startsWith(path + "/"),
    [location.pathname]
  );

 const activeParentId = useMemo(() => {
    return (
      NAV_ITEMS.find((item) =>
        item.subItems?.some((sub) => isSubActive(sub.path))
      )?.id ?? null
    );
  }, [location.pathname, isSubActive]);

const openMenuId = manuallyClosed === activeParentId
  ? manualOpenId  // user explicitly closed the active parent → respect it
  : (manualOpenId ?? activeParentId)

const toggleSubmenu = (id: string) => {
  const isCurrentlyOpen = openMenuId === id
  if (isCurrentlyOpen) {
    setManualOpenId(null)
    setManuallyClosed(id)  // remember user closed this
  } else {
    setManualOpenId(id)
    setManuallyClosed(null)
  }
}
  const [subMenuHeights, setSubMenuHeights] = useState<
    Record<string, number>
  >({});

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );


 
 

  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.subItems && subMenuRefs.current[item.id]) {
        setSubMenuHeights((prev) => ({
          ...prev,
          [item.id]:
            subMenuRefs.current[item.id]?.scrollHeight ?? 0,
        }));
      }
    });
  }, [isOpen]);

  return (
    <aside
      style={{
        width: isOpen ? 250 : 72,
        transition: "width 0.3s ease",
        borderInlineEnd: "1px solid var(--border)",
        background: "var(--bg-card)",
      }}
      className="fixed inset-s-0 top-0 flex flex-col h-screen z-50"
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          height: 64,
        }}
        className={`flex items-center gap-2 px-4 shrink-0 ${
          !isOpen ? "justify-center" : ""
        }`}
      >
        <img src={Logosulgn} alt="Logo" className="w-10 h-10" />

        {isOpen && (
          <img src={Logo} alt="Logo" className="w-25" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 overflow-y-auto py-4 px-3 no-scrollbar">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isMenuOpen = openMenuId === item.id;

            const hasActiveChild =
              item.subItems?.some((s) => isSubActive(s.path)) ??
              false;

            return (
              <li key={item.id}>
                {item.subItems ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      style={{
                        color:
                          isMenuOpen || hasActiveChild
                            ? "var(--accent)"
                            : "var(--text-secondary)",
                      }}
                      className={`w-full flex items-center gap-2 p-2.5 transition-colors cursor-pointer
                        ${
                          !isOpen
                            ? "justify-center"
                            : "justify-between"
                        }
                        hover:bg-[var(--bg-hover)]
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 w-5 h-5">
                          {item.icon}
                        </span>

                        {isOpen && (
                          <span className="text-sm font-medium capitalize">
                            {item.name}
                          </span>
                        )}
                      </div>

                      {isOpen && (
                        <FaAngleRight
                          style={{
                            color: isMenuOpen
                              ? "var(--accent)"
                              : "var(--text-muted)",
                          }}
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                            isMenuOpen ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </button>

                    {isOpen && (
                      <div
                        ref={(el) => {
                          subMenuRefs.current[item.id] = el;
                        }}
                        style={{
                          height: isMenuOpen
                            ? subMenuHeights[item.id] ?? 0
                            : 0,
                        }}
                        className="overflow-hidden transition-all duration-200 ease-in-out"
                      >
                        <ul
                          style={{
                            borderInlineStart:
                              "2px solid var(--border)",
                          }}
                          className="mt-1 ms-4 py-1"
                        >
                          {item.subItems.map((sub) => {
                            const active = isSubActive(
                              sub.path
                            );

                            return (
                              <li key={sub.name}>
                                <Link
                                  to={sub.path}
                                  style={{
                                    color: active
                                      ? "var(--accent)"
                                      : "var(--text-muted)",

                                    background: active
                                      ? "var(--accent-soft)"
                                      : "transparent",

                                    fontWeight: active
                                      ? 600
                                      : 400,
                                  }}
                                  className="relative flex items-center px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--accent)]"
                                >
                                  {active && (
                                    <span
                                      style={{
                                        background:
                                          "var(--accent)",
                                        borderRadius: 99,
                                      }}
                                      className="absolute top-0 bottom-0 w-0.5 inset-s-[-2px]"
                                    />
                                  )}

                                  <span className="capitalize">
                                    {sub.name}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </>
                ) : item.path ? (
                  <Link
                    to={item.path}
                    style={{
                      color: isActive(item.path)
                        ? "var(--accent)"
                        : "var(--text-secondary)",

                      background: isActive(item.path)
                        ? "var(--accent-soft)"
                        : "transparent",
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[var(--bg-hover)]
                      ${!isOpen ? "justify-center" : ""}
                    `}
                  >
                    <span className="shrink-0 w-5 h-5">
                      {item.icon}
                    </span>

                    {isOpen && (
                      <span className="text-sm font-medium capitalize">
                        {item.name}
                      </span>
                    )}
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default AppSidebar;