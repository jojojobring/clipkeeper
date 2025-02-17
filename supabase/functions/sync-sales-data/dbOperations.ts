
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { HeaderData, SaleData } from './types.ts';

export async function insertData(
  supabase: ReturnType<typeof createClient>,
  headerData: HeaderData,
  salesData: SaleData[]
): Promise<void> {
  const { data: headerRecord, error: headerError } = await supabase
    .from('report_headers')
    .insert([headerData])
    .select()
    .single();

  if (headerError) {
    throw headerError;
  }

  const salesWithHeader = salesData.map(sale => ({
    ...sale,
    report_header_id: headerRecord.id
  }));

  const { error: salesError } = await supabase
    .from('sales')
    .insert(salesWithHeader);

  if (salesError) {
    throw salesError;
  }
}
