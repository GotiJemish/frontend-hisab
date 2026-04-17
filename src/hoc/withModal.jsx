"use client";

import { useState, useCallback, useRef } from "react";
import Modal from "@/components/ui/Modal";

/**
 * useModal — hook for controlling a Modal from inside a function component.
 *
 * @returns {{
 *   isOpen: boolean,
 *   modalProps: object,
 *   openModal: (config?: ModalConfig) => void,
 *   closeModal: () => void,
 *   ModalRenderer: () => JSX.Element | null,
 * }}
 *
 * @example
 * const { openModal, closeModal, ModalRenderer } = useModal();
 *
 * openModal({
 *   title: "Confirm Delete",
 *   size: "sm",
 *   closeable: true,
 *   footer: <Btn variant="danger" onClick={closeModal}>Delete</Btn>,
 *   children: <p>Are you sure?</p>,
 * });
 *
 * return (
 *   <>
 *     <Btn onClick={() => openModal({ title: "My Modal", children: <p>Hello!</p> })}>Open</Btn>
 *     <ModalRenderer />
 *   </>
 * );
 *
 * @typedef {{
 *   title?: string,
 *   size?: "sm"|"md"|"lg"|"xl"|"full",
 *   closeable?: boolean,
 *   className?: string,
 *   footer?: React.ReactNode,
 *   children?: React.ReactNode,
 * }} ModalConfig
 */
export function useModal(defaultConfig = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(defaultConfig);

  const openModal = useCallback((newConfig = {}) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  /** Drop <ModalRenderer /> anywhere in the JSX tree of the same component. */
  const ModalRenderer = useCallback(
    () => (
      <Modal
        open={isOpen}
        onClose={closeModal}
        title={config.title}
        size={config.size ?? "md"}
        closeable={config.closeable ?? true}
        footer={config.footer}
        className={config.className}
      >
        {config.children}
      </Modal>
    ),
    [isOpen, closeModal, config]
  );

  return {
    isOpen,
    openModal,
    closeModal,
    ModalRenderer,
    /** Direct prop spread for <Modal {...modalProps} /> if preferred */
    modalProps: {
      open: isOpen,
      onClose: closeModal,
      ...config,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════
   withModal — Higher-Order Component
   ═══════════════════════════════════════════════════════════════════

   Wraps WrappedComponent and injects three extra props:
     • openModal(config)  — opens the managed Modal with optional config
     • closeModal()       — closes the Modal
     • isModalOpen        — boolean state

   The HOC renders the Modal itself, so WrappedComponent does NOT need
   to manage any modal state or render <Modal> manually.

   @template P
   @param {React.ComponentType<P>} WrappedComponent
   @param {ModalConfig} [defaultConfig={}]  — baseline config (can be
          overridden at call-time by passing args to openModal())
   @returns {React.ComponentType<Omit<P, "openModal"|"closeModal"|"isModalOpen">>}

   @example
   // 1. Define your component
   function InvoiceTable({ openModal, closeModal }) {
     return (
       <Btn onClick={() =>
         openModal({
           title: "New Invoice",
           size: "lg",
           footer: <Btn onClick={closeModal}>Cancel</Btn>,
           children: <InvoiceForm />,
         })
       }>
         Create Invoice
       </Btn>
     );
   }

   // 2. Wrap it
   export default withModal(InvoiceTable);

   // 3. Use as normal — no extra props needed from the parent
   <InvoiceTable />
*/
export function withModal(WrappedComponent, defaultConfig = {}) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function WithModal(props) {
    const { isOpen, openModal, closeModal, modalProps } = useModal(defaultConfig);

    return (
      <>
        <WrappedComponent
          {...props}
          openModal={openModal}
          closeModal={closeModal}
          isModalOpen={isOpen}
        />
        <Modal {...modalProps} />
      </>
    );
  }

  WithModal.displayName = `withModal(${displayName})`;
  return WithModal;
}

export default withModal;
