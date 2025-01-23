import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { HeaderData, SaleData } from './types.ts';

export async function insertData(
  supabase: ReturnType<typeof createClient>,
  headerData: HeaderData,
  salesData: SaleData[]
): Promise<void> {
  // Insert header record
  const { data: headerRecord, error: headerError } = await supabase
    .from('report_headers')
    .insert([headerData])
    .select()
    .single();

  if (headerError) {
    console.error('Error inserting header:', headerError);
    throw headerError;
  }

  // Update sales data with header ID
  const salesWithHeader = salesData.map(sale => ({
    ...sale,
    report_header_id: headerRecord.id
  }));

  // Insert sales records
  const { error: salesError } = await supabase
    .from('sales')
    .insert(salesWithHeader);

  if (salesError) {
    console.error('Error inserting sales:', salesError);
    throw salesError;
  }
}