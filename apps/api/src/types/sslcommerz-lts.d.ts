declare module "sslcommerz-lts" {
  export interface SSLCommerzInitData {
    total_amount: number | string;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    ipn_url?: string;
    shipping_method?: string;
    product_name?: string;
    product_category?: string;
    product_profile?: string;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_add2?: string;
    cus_city: string;
    cus_state?: string;
    cus_postcode?: string;
    cus_country: string;
    cus_phone: string;
    cus_fax?: string;
    ship_name?: string;
    ship_add1?: string;
    ship_add2?: string;
    ship_city?: string;
    ship_state?: string;
    ship_postcode?: string;
    ship_country?: string;
    multi_card_name?: string;
    value_a?: string;
    value_b?: string;
    value_c?: string;
    value_d?: string;
    num_of_item?: number | string;
    [key: string]: unknown;
  }

  export interface SSLCommerzInitResponse {
    status: string;
    failedreason?: string;
    sessionkey?: string;
    GatewayPageURL?: string;
    redirectGatewayURL?: string;
    DirectPaymentURL?: string;
    storeBanner?: string;
    storeLogo?: string;
    desc?: string[];
    is_direct_pay_enable?: string;
    [key: string]: unknown;
  }

  export interface SSLCommerzValidateData {
    val_id: string;
  }

  export interface SSLCommerzValidateResponse {
    status: string;
    tran_date?: string;
    tran_id?: string;
    val_id?: string;
    amount?: string | number;
    store_amount?: string | number;
    currency?: string;
    bank_tran_id?: string;
    card_type?: string;
    card_no?: string;
    card_issuer?: string;
    card_brand?: string;
    card_sub_brand?: string;
    card_issuer_country?: string;
    card_issuer_country_code?: string;
    currency_type?: string;
    currency_amount?: string | number;
    currency_rate?: string | number;
    base_fair?: string | number;
    value_a?: string;
    value_b?: string;
    value_c?: string;
    value_d?: string;
    risk_level?: string | number;
    risk_title?: string;
    error?: string;
    [key: string]: unknown;
  }

  export interface SSLCommerzRefundData {
    bank_tran_id: string;
    refund_amount: number | string;
    refund_remarks: string;
    refl_id?: string;
  }

  export interface SSLCommerzRefundResponse {
    status: string;
    refund_ref_id?: string;
    errorReason?: string;
    [key: string]: unknown;
  }

  export interface SSLCommerzRefundQueryData {
    refund_ref_id: string;
  }

  export interface SSLCommerzTransactionQueryData {
    tran_id?: string;
    sessionkey?: string;
  }

  export default class SSLCommerzPayment {
    constructor(store_id: string, store_passwd: string, is_live: boolean);
    init(data: SSLCommerzInitData): Promise<SSLCommerzInitResponse>;
    validate(data: SSLCommerzValidateData): Promise<SSLCommerzValidateResponse>;
    initiateRefund(data: SSLCommerzRefundData): Promise<SSLCommerzRefundResponse>;
    refundQuery(data: SSLCommerzRefundQueryData): Promise<Record<string, unknown>>;
    transactionQueryBySessionId(data: { sessionkey: string }): Promise<Record<string, unknown>>;
    transactionQueryByTransactionId(data: { tran_id: string }): Promise<Record<string, unknown>>;
  }
}
