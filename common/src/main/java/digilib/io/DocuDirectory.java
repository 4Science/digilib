package digilib.io;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;

import org.apache.log4j.Logger;

import digilib.conf.DigilibConfiguration;
import digilib.io.FileOps.FileClass;
import digilib.meta.DirMeta;
import digilib.meta.MetaFactory;

/**
 * Class representing a directory containing (image) files.
 * 
 * Files can be access by index or name. All files are of the same FileClass.
 * The DocuDirectory holds DirMeta. 
 * 
 * Subclasses of DocuDirectory can also hold multiple scaled versions of an image file. 
 * 
 * @author casties
 */
public abstract class DocuDirectory implements Iterable<DocuDirent> {

	protected Logger logger = Logger.getLogger(this.getClass());

	/** type of files in this DocuDirectory */
    protected FileClass fileClass = FileClass.IMAGE;
    
    /** parent DocuDirectory */
    protected DocuDirectory parent = null;
    
	/** list of files (DocuDirent) */
	protected List<DocuDirent> files = null;

	/** directory object is valid (exists on disk) */
	protected boolean isValid = false;

	/** directory name (digilib canonical form) */
	protected String dirName = null;

	/** directory metadata */
	protected DirMeta meta = null;

	/** time of last access of this object (not the filesystem) */
	protected long objectATime = 0;

	/** time directory was last modified on the file system */
	protected long dirMTime = 0;

	/**
	 * Configure object with digilib directory path and a parent DocuDirCache.
	 * 
	 * Directory names at the given path are appended to the base directories
	 * from the cache. The directory is checked on disk and isValid is set.
	 * 
	 * @see readDir
	 * 
	 * @param path
	 *            digilib directory path name
	 * @param fileClass 
	 *            type of files in this DocuDirectory
	 * @param dlConfig
	 *            digilib config
	 */
	public void configure(String path, FileClass fileClass, DigilibConfiguration dlConfig) {
		this.dirName = path;
		this.fileClass = fileClass;
		// clear directory list
		files = new ArrayList<DocuDirent>();
		dirMTime = 0;
		meta = MetaFactory.getDirMetaInstance();
	}

	/**
	 * number of DocuFiles in this directory. 
	 */
	public int size() {
		return (files != null) ? files.size() : 0;
	}

	/**
	 * Returns the ImageFileSet at the index.
	 * 
	 * @param index
	 * @return
	 */
	public DocuDirent get(int index) {
		if ((files == null) || (index >= files.size())) {
			return null;
		}
		return files.get(index);
	}

	/**
	 * Read the filesystem directory and fill this object.
	 * 
	 * Clears the List and (re)reads all files.
	 * 
	 * @return boolean the directory exists
	 */
	public abstract boolean readDir();


	/**
	 * Check to see if the directory has been modified and reread if necessary.
	 * 
	 * @return boolean the directory is valid
	 */
    public abstract boolean refresh();


	/**
	 * Read directory metadata.
	 *  
	 */
	public void readMeta() {
	    if (meta != null) {
	        meta.readMeta(this);
	    }
	}


    /**
     * check directory metadata.
     *  
     */
    public void checkMeta() {
        if (meta != null) {
            meta.checkMeta(this);
        }
    }


	/**
	 * Update access time.
	 * 
	 * @return long time of last access.
	 */
	public long touch() {
		long t = objectATime;
		objectATime = System.currentTimeMillis();
		return t;
	}

    /**
     * Searches for the file with the name <code>fn</code>.
     * 
     * Searches the directory for the file with the name <code>fn</code> and
     * returns its index. Returns -1 if the file cannot be found.
     * 
     * @param fn
     *            filename
     * @return int index of file <code>fn</code>
     */
	public int indexOf(String fn) {
		if (!isRead()) {
			// read directory now
			if (!readDir()) {
				return -1;
			}
		}
		// empty directory?
		if (files == null) {
			return -1;
		}
        
		// search for exact match (DocuDirent does compareTo<String>)
        // OBS: fileList needs to be sorted first (see )! <hertzhaft>
		int idx = Collections.binarySearch(files, fn);
		if (idx >= 0) {
			return idx;
		} else {
			// try closest matches without extension
			idx = -idx - 1;
			if ((idx < files.size()) && isBasenameInList(files, idx, fn)) {
				// idx matches
				return idx;
			} else if ((idx > 0) && isBasenameInList(files, idx - 1, fn)) {
				// idx-1 matches
				return idx - 1;
			} else if ((idx + 1 < files.size()) && isBasenameInList(files, idx + 1, fn)) {
				// idx+1 matches
				return idx + 1;
			}
		}
		return -1;
	}

    protected boolean isBasenameInList(List<DocuDirent> fileList, int idx, String fn) {
    	String dfn = FileOps.basename((fileList.get(idx)).getName());
    	return (dfn.equals(fn) || dfn.equals(FileOps.basename(fn))); 
    }


	/**
	 * Finds the DocuDirent with the name <code>fn</code>.
	 * 
	 * Searches the directory for the DocuDirent with the name <code>fn</code>
	 * and returns it. Returns null if the file cannot be found.
	 * 
	 * @param fn
	 *            filename
	 * @return DocuDirent
	 */
	public DocuDirent find(String fn) {
		int i = indexOf(fn);
		if (i >= 0) {
			return files.get(i);
		}
		return null;
	}

	/**
	 * Returns the digilib canonical name.
	 * 
	 * @return
	 */
	public String getDirName() {
		return dirName;
	}

	/**
	 * The directory is valid (exists on disk).
	 * 
	 * @return boolean
	 */
	public boolean isValid() {
		return isValid;
	}

	/**
	 * The directory has been read from disk.
	 * 
	 * @return
	 */
	public boolean isRead() {
		return (dirMTime != 0);
	}

	/**
	 * @return long
	 */
	public long getAccessTime() {
		return objectATime;
	}

	/**
	 * @return long
	 */
	public long getDirMTime() {
		return dirMTime;
	}

    public DirMeta getMeta() {
        return meta;
    }
    
    /**
     * Returns an Iterator over all DocuDirents in this DocuDirectory in default order.
     * 
     * @return
     */
    public Iterator<DocuDirent> iterator() {
    	return files.iterator();
    }

	/**
	 * Returns a possible parent directory name for path fn.
	 * 
	 * @param fn
	 * @return
	 */
	public abstract String createParentName(String fn);

	/**
	 * Returns a possible file name for path fn.
	 * @param fn
	 * @return
	 */
	public abstract String createFilename(String fn);

	/**
	 * Returns the parent DocuDirectory.
	 * 
	 * @return
	 */
	public DocuDirectory getParent() {
		return parent;
	}

	/**
	 * Sets the parent DocuDirectory.
	 * @param pd
	 */
	public void setParent(DocuDirectory pd) {
		parent = pd;
	}

}
