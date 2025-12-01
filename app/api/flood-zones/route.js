import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, 
        zone_name, 
        description, 
        risk_level,
        area_sq_km,
        ST_AsGeoJSON(geom) AS geometry,
        created_at
      FROM flood_zones
      ORDER BY risk_level DESC, zone_name ASC
    `);
    
    return Response.json(rows);
  } catch (error) {
    console.error('Error fetching flood zones:', error);
    return Response.json({ error: 'Failed to fetch flood zones' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Assuming data contains WKT (Well-Known Text) for geometry
    const query = `
      INSERT INTO flood_zones (zone_name, description, risk_level, area_sq_km, geom)
      VALUES (?, ?, ?, ?, ST_GeomFromText(?))
    `;
    
    await pool.query(query, [
      data.zone_name,
      data.description,
      data.risk_level,
      data.area_sq_km,
      data.geometry_wkt
    ]);
    
    return Response.json({ message: 'Flood zone added successfully' });
  } catch (error) {
    console.error('Error adding flood zone:', error);
    return Response.json({ error: 'Failed to add flood zone' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await pool.query('DELETE FROM flood_zones WHERE id = ?', [id]);
    
    return Response.json({ message: 'Flood zone deleted successfully' });
  } catch (error) {
    console.error('Error deleting flood zone:', error);
    return Response.json({ error: 'Failed to delete flood zone' }, { status: 500 });
  }
}