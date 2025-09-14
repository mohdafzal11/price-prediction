/**
 * Schema Registry - A utility to manage and deduplicate structured data schemas
 * This helps prevent duplicate schemas from being added to the page
 */

// Define a type for schema objects
export interface Schema {
  '@type': string;
  '@context'?: string;
  name?: string;
  [key: string]: any;
}

// Create a singleton registry to track schemas across the application
class SchemaRegistry {
  private static instance: SchemaRegistry;
  private schemas: Schema[] = [];
  private initialized = false;

  private constructor() {}

  public static getInstance(): SchemaRegistry {
    if (!SchemaRegistry.instance) {
      SchemaRegistry.instance = new SchemaRegistry();
    }
    return SchemaRegistry.instance;
  }

  /**
   * Register schemas and deduplicate them
   * @param newSchemas - Array of schemas to register
   * @returns Deduplicated array of schemas
   */
  public register(newSchemas: Schema | Schema[]): Schema[] {
    // Handle single schema case
    const schemasToAdd = Array.isArray(newSchemas) ? newSchemas : [newSchemas];
    
    // If this is the first initialization, just set the schemas
    if (!this.initialized) {
      this.schemas = [...schemasToAdd];
      this.initialized = true;
      return this.schemas;
    }

    // Otherwise, merge with existing schemas, deduplicating by type and name
    schemasToAdd.forEach(schema => {
      const schemaType = schema['@type'];
      const schemaName = schema.name || '';
      
      // Check if we already have this schema type+name combination
      const existingIndex = this.schemas.findIndex(
        existing => 
          existing['@type'] === schemaType && 
          (existing.name === schemaName || (!existing.name && !schemaName))
      );
      
      if (existingIndex === -1) {
        // If it's a new schema, add it
        this.schemas.push(schema);
      } else {
        // If it's a duplicate, we could potentially update the existing one
        // For now, we'll just keep the first one we encountered
      }
    });
    
    return this.schemas;
  }

  /**
   * Get all registered schemas
   * @returns Array of deduplicated schemas
   */
  public getSchemas(): Schema[] {
    return this.schemas;
  }

  /**
   * Clear all registered schemas
   */
  public clear(): void {
    this.schemas = [];
    this.initialized = false;
  }
}

// Export a singleton instance
export const schemaRegistry = SchemaRegistry.getInstance();

// Helper function to register schemas
export function registerSchemas(schemas: Schema | Schema[]): Schema[] {
  return schemaRegistry.register(schemas);
}

// Helper function to get all schemas
export function getRegisteredSchemas(): Schema[] {
  return schemaRegistry.getSchemas();
}
