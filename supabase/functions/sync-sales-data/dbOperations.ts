import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { HeaderData, SaleData } from './types.ts';

export async function insertData(
  supabase: ReturnType<typeof createClient>,
  headerData: HeaderData,
  salesData: SaleData[]
): Promise<void> {
  try {
    console.log('Starting database insertion - header data');
    const { data: headerRecord, error: headerError } = await supabase
      .from('report_headers')
      .insert([headerData])
      .select()
      .single();

    if (headerError) {
      console.error('Error inserting header:', headerError);
      throw headerError;
    }

    console.log('Successfully inserted header record:', headerRecord);

    // Update sales data with header ID
    const salesWithHeader = salesData.map(sale => ({
      ...sale,
      report_header_id: headerRecord.id
    }));

    console.log('Starting database insertion - sales data');
    const { error: salesError } = await supabase
      .from('sales')
      .insert(salesWithHeader);

    if (salesError) {
      console.error('Error inserting sales:', salesError);
      throw salesError;
    }

    console.log('Successfully inserted all sales records');
  } catch (error) {
    console.error('Database operation error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}