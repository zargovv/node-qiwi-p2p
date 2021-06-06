export type BillPaySource = 'qw' | 'card';
export type CustomFieldsResolvable =
  | BillCustomFields
  | (Omit<IBillCustomFields, 'paySourcesFilter'> & {
      paySourcesFilter?: string[] | string;
    });

export interface IBillCustomFields {
  paySourcesFilter?: string;
  themeCode?: string;
}

class BillCustomFields {
  static from(customFields: CustomFieldsResolvable) {
    if (customFields instanceof BillCustomFields) return customFields;
    return new BillCustomFields({
      paySourcesFilter:
        typeof customFields.paySourcesFilter === 'string' ||
        !customFields.paySourcesFilter
          ? customFields.paySourcesFilter
          : customFields.paySourcesFilter.join(','),
      themeCode: customFields.themeCode
    });
  }

  static validate(customFields: CustomFieldsResolvable) {
    customFields = BillCustomFields.from(customFields);
    if (customFields.themeCode && customFields.themeCode.length > 255) {
      throw new Error('INVALID_THEME_CODE');
    }
    return true;
  }

  paySourcesFilter: BillPaySource[] | null = null;
  themeCode: string | null = null;

  constructor(customFields: IBillCustomFields) {
    this.patch(customFields);
  }

  patch(data: IBillCustomFields) {
    this.paySourcesFilter =
      data.paySourcesFilter != null
        ? (data.paySourcesFilter
            .split(',')
            .filter(source => source.length > 0) as BillPaySource[])
        : null;
    this.themeCode = data.themeCode != null ? data.themeCode : null;
  }

  raw() {
    if (this.paySourcesFilter == null && this.themeCode == null) return {};

    const customFields = {};
    if (this.paySourcesFilter != null) {
      Object.assign(customFields, {
        paySourcesFilter: this.paySourcesFilter.join(',')
      });
    }
    if (this.themeCode != null) {
      Object.assign(customFields, { themeCode: this.themeCode });
    }

    return { customFields };
  }
}

export default BillCustomFields;
