import { useEffect, useState } from 'react';
import { Input, InputGroup, VStack } from 'rsuite';

export interface FolderSelectorProperties {
  folderPath: string | null;
  onFolderSelected: (folderPath: string | null) => void;
}

const FolderSelector = ({ folderPath, onFolderSelected }: FolderSelectorProperties) => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>('');

  useEffect(() => {
    setSelectedFolder(folderPath);
  }, [folderPath]);

  const handleFolderSelect = () => {
    window.utilsService.openFolderDialog().then((selected) => {
      if (selected === null) return;
      onFolderSelected(selected);
      setSelectedFolder(selected);
    });
  }

  return (
    <VStack>
      <InputGroup>
        <InputGroup.Addon
          style={{ cursor: 'pointer', padding: '0px 10px' }}
          onClick={handleFolderSelect}>
          Select Folder
        </InputGroup.Addon>
        <Input
          readOnly
          type="text"
          placeholder=""
          value={selectedFolder || ''}
          style={{ cursor: 'pointer' }}
          onClick={handleFolderSelect}
        />
      </InputGroup>

    </VStack>
  );
};

export default FolderSelector;
