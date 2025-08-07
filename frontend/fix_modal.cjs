const fs = require('fs');
const path = require('path');

// Read the current file
const filePath = path.join(__dirname, 'src/pages/Properties.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add modal state variables after the existing state declarations
const stateInsertion = `  // State for new unit details modal
  const [showUnitDetailsModal, setShowUnitDetailsModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<any>(null);
  const [isLoadingUnitDetails, setIsLoadingUnitDetails] = useState(false);

  // Load units data when property changes`;

content = content.replace('  // Load units data when property changes', stateInsertion);

// Add modal handler functions after loadUnitDetails function
const handlerInsertion = `  };

  // Modal handler functions
  const handleOpenUnitDetails = async (unit: any) => {
    setSelectedUnit(unit);
    setShowUnitDetailsModal(true);
    setIsLoadingUnitDetails(true);
    
    try {
      const details = await loadUnitDetails(unit.id);
      setSelectedUnitDetails(details);
    } catch (error) {
      console.error('Failed to load unit details:', error);
      setSelectedUnitDetails({});
    } finally {
      setIsLoadingUnitDetails(false);
    }
  };

  const handleCloseUnitDetails = () => {
    setShowUnitDetailsModal(false);
    setSelectedUnit(null);
    setSelectedUnitDetails(null);
    setIsLoadingUnitDetails(false);
  };

  if (!property) return null;`;

content = content.replace('  if (!property) return null;', handlerInsertion);

// Update the onViewDetails callback
content = content.replace(
  /onViewDetails=\{\(\) => \{\s*\/\/ TODO: Implement unit details modal\s*console\.log\('View unit details:', unit\.id\);\s*\}/g,
  'onViewDetails={() => {\n                              handleOpenUnitDetails(unit);\n                            }}'
);

// Add the modal component at the end of PropertyViewSheet
const modalInsertion = `      </SheetContent>
    </Sheet>
    
    {/* Unit Details Modal */}
    <EnhancedUnitDetailsSheet
      isOpen={showUnitDetailsModal}
      onClose={handleCloseUnitDetails}
      unit={selectedUnit}
      unitDetails={selectedUnitDetails}
      isLoading={isLoadingUnitDetails}
    />
  );
};`;

content = content.replace('      </SheetContent>\n    </Sheet>\n  );', modalInsertion);

// Write the updated content back to the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Successfully updated Properties.tsx with modal integration!'); 