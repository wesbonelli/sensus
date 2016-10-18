import java.io.BufferedReader;
import java.io.File;
import java.io.InputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.SortedMap;
import java.util.TreeMap;
import java.util.HashMap;
import java.util.Timer;
import java.util.TimerTask;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.concurrent.TimeUnit;
import org.json.JSONArray;
import org.json.JSONObject;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import com.amazonaws.AmazonWebServiceClient;
import com.amazonaws.AmazonClientException;
import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.profile.ProfileCredentialsProvider;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.Bucket;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.ListObjectsRequest;
import com.amazonaws.services.s3.model.ObjectListing;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectSummary;
import com.amazonaws.services.s3.model.ListObjectsV2Request;
import com.amazonaws.services.s3.model.ListObjectsV2Result;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.util.zip.GZIPInputStream;
import org.apache.commons.io.IOUtils;







public class DatabaseUpdater {

	////////
	// private members
	////////

	private String temporaryLocalDataFilePath;
	
	////////
	// public methods
	////////

	public DatabaseUpdater() {
		temporaryLocalDataFilePath = null;
	}

	public String getTemporaryLocalDataFilePath() {
		return temporaryLocalDataFilePath;
	}

	public void setTemporaryLocalDataFilePath(String path) {
		temporaryLocalDataFilePath = path;
	}

	public static void handleException(Exception ex, boolean exit) {
		System.out.println(ex.getClass().getName() + ": " + ex.getMessage());
		ex.printStackTrace();
		if (exit)
			System.exit(0);
	}





	////////
	// Entry point. When executed, this program first checks a data source for new files.
	// If new files are found, it downloads, parses, and updates a database from files one at a time.
	// @param 	temporaryLocalDataFilePath 		the directory to download files into
	// @param 	s3Bucket 						the S3 bucket acting as data sourcee
	// @param 	databaseServer					the database to be updated
	// @param 	databasePort					"
	// @param 	databaseName					"
	// @param 	databaseUser					"
	// @param 	databasePassword				"
	////////

	public static void main(String[] args) {

		DatabaseUpdater databaseUpdater = new DatabaseUpdater();
		DataSource dataSource = new DataSource();
		Database database = new Database();

		// get arguments
		databaseUpdater.setTemporaryLocalDataFilePath(args[0]);
		final String s3Bucket = args[1];
		final String databaseServer = args[2];
		final String databasePort = args[3];
		final String databaseName = args[4];
		final String databaseUser = args[5];
		final String databasePassword = args[6];

		// data source connection
		Thread s3CheckThread = new Thread(new Runnable() {
    		public void run() {
    			dataSource.setS3Bucket(s3Bucket);
    			dataSource.updateS3RootDirectoryCount();
    			dataSource.updateS3Keys();
    		}
		});

		// database connection
		Thread postgreSQLConnectThread = new Thread(new Runnable() {
    		public void run() {
    			database.connectToPostgreSQL(databaseServer, databasePort, databaseName, databaseUser, databasePassword);

    			// wait for the S3 connection before continuing
    			try {
    				s3CheckThread.join();
    			} catch (Exception ex) {
    				handleException(ex, true);
    			}

    			System.out.println("Updating database from files...");

				try {
					// transfer data to the database file by file so we don't use excessive disk space
					for (String key : dataSource.getS3Keys()) {

						System.out.println(key);

						// get a json array of the file's contents
						JSONArray fileContents = dataSource.downloadS3Object(key);

						// attempt to update the database with the json data
						database.updatePostgreSQLDatabaseFromJSON(key.split("/")[0], fileContents);
					}
				} catch (Exception ex) {
					handleException(ex, true);
				}

				database.disconnectFromPostgreSQL();
    		}
		});

		// start threads
		s3CheckThread.start();
		postgreSQLConnectThread.start();
	}
}







////////
// The database to update.
////////

class Database {

	////////
	// private members
	////////

	private String server;
	private String port;
	private String name;
	private String user;
	private String password;
	private Connection connection;

	////////
	// public methods
	////////

	public Database() {
		server = null;
		port = null;
		name = null;
		user = null;
		password = null;
		connection = null;
	}

	public String getServer() {
		return this.server;
	}

	public String getPort() {
		return port;
	}

	public String getName() {
		return this.name;
	}

	public String getUser() {
		return this.user;
	}

	public Connection getConnection() {
		return this.connection;
	}

	public static void handleException(Exception ex, boolean exit) {
		System.out.println(ex.getClass().getName() + ": " + ex.getMessage());
		ex.printStackTrace();
		if (exit)
			System.exit(0);
	}

	public boolean connectToPostgreSQL(String server, String port, String name, String user, String password) {
		this.server = server;
		this.port = port;
		this.name = name;
		this.user = user;
		this.password = password;

		try {
	        Class.forName("org.postgresql.Driver");
	        this.connection = DriverManager.getConnection("jdbc:postgresql://" + this.server + ":" + this.port + "/" + this.name, this.user, this.password);
	        this.connection.setAutoCommit(false);
	        return true;
	    } catch (Exception ex) {
	        handleException(ex, true);
	        return false;
	    }
	}

	public void disconnectFromPostgreSQL() {
		try {
			this.connection.close();
		} catch (Exception ex) {
	        handleException(ex, true);
	    }
	}

	public void updatePostgreSQLDatabaseFromJSON(String identifier, JSONArray jsonArray) {
		try {
			Statement statement = this.connection.createStatement();
			PreparedStatement prepared = null;

			String type = null;
			boolean first = true;
			
			// loop through each entry in the array
			for (int i = 0; i < jsonArray.length(); i += 1) {
				if (jsonArray.isNull(i)) {
					continue;
				}
				JSONObject jsonObject = jsonArray.getJSONObject(i);
				SortedMap<String, Object> entry = new TreeMap<String, Object>();

				// attach identifier to the json data (directory one level deeper than the bucket)
				entry.put("identifier", identifier);
				
				// loop through each value in the current entry
				for (Object key : jsonObject.keySet()) {
					String keyStr = ((String) key);
					Object obj = jsonObject.get(keyStr);
					String column = "";
					Object value = null;
					switch (keyStr) {
						case "$type":
							// set type so we can differentiate between shared cases below
							String[] split1 = String.valueOf(obj).split(" ");
							String[] split2 = split1[0].split("\\.");
							String sub = split2[split2.length - 1];
							type = sub.substring(0, sub.length() - 1).toLowerCase();
							column = "type";
							break;
						// "on" cannot be the name of a PostgreSQL column
						case "On":
							column = "ison";
							value = Boolean.parseBoolean(obj.toString());
							break;
						default:
							column = keyStr.toLowerCase();	// PostgreSQL column names are all lowercase
							value = obj.toString();			// add everything as a string for now
							break;
					}
					if (!column.equals("type") && !column.isEmpty()) {
						entry.put(column, value);
					}
				}
				
				// if first object in file, get column names and prepare insert statement
				String query = null;
				SortedMap<String, Integer> columns = new TreeMap<String, Integer>();
				if (first) {
					query = "SELECT * FROM " + type;
					ResultSet results = statement.executeQuery(query);
					ResultSetMetaData resultsMetaData = results.getMetaData();
					int numColumns = resultsMetaData.getColumnCount();
					columns = new TreeMap<String, Integer>();
					for (int j = 1; j <= numColumns; j += 1) {
						columns.put(resultsMetaData.getColumnName(j), resultsMetaData.getColumnType(j));
					}
					query = "INSERT INTO " + type + " (";
					for (String key : columns.keySet()) {
						query += key + ", ";
					}
					query = query.substring(0, query.length() - 2);		// remove last comma
					query += ") SELECT ";
					for (int j = 0; j < numColumns; j += 1) {
						query += "?, ";
					}
					query = query.substring(0, query.length() - 2);		// remove last comma
					query += " WHERE NOT EXISTS (SELECT id FROM " + type + " WHERE id = '" + entry.get("id").toString() + "');";
					prepared = this.connection.prepareStatement(query);
					first = false;
				}
				
				// assign parameter types and add batch
				int index = 1;
				for (String key : columns.keySet()) {
					int valueType = columns.get(key);
					if (valueType == -5) {				// BIGINT
						try {
							prepared.setInt(index, Integer.parseInt(entry.get(key).toString()));
						} catch (Exception ex) {
							prepared.setNull(index, java.sql.Types.NULL);
						}
					} else if (valueType == 12) {		// VARCHAR
						try {
							prepared.setString(index, entry.get(key).toString());
						} catch (Exception ex) {
							prepared.setNull(index, java.sql.Types.NULL);
						}
					} else if (valueType == 16) {		// BOOLEAN
						try {
							prepared.setBoolean(index, Boolean.parseBoolean(entry.get(key).toString()));
						} catch (Exception ex) {
							prepared.setNull(index, java.sql.Types.NULL);
						}
					} else if (valueType == 93) {		// TIMESTAMP
						try {
							String shortened = entry.get(key).toString().substring(0, 20);
							Date timestamp = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss").parse(shortened);
							prepared.setTimestamp(index, new java.sql.Timestamp(timestamp.getTime()));
						} catch (Exception ex) {
							prepared.setNull(index, java.sql.Types.NULL);
						}
					} else if (valueType == 8) {		// DOUBLE
						try {
							prepared.setDouble(index, Double.parseDouble(entry.get(key).toString()));
						} catch (Exception ex) {
							prepared.setNull(index, java.sql.Types.NULL);
						}
					} else {
						prepared.setNull(index, java.sql.Types.NULL);
					}
					index += 1;
				}
				prepared.addBatch();
			}
			int[] results = prepared.executeBatch();
			for (int x : results) {
				if (x < 1) {
					System.out.println("database:queryfailure");
				}
			}
			prepared.close();
			this.connection.commit();
		} catch (Exception ex) {
			handleException(ex, true);
		}
	}

	// TODO
	public void connectToMySQL(String server, String port, String name, String user, String password) {

	}
}







////////
// The data source to update the database from.
////////

class DataSource {

	////////
	// private members
	////////

	private AmazonS3 s3Client;
	private String s3Bucket;
	private int rootDirectoryCount;
	private boolean canConnect;
	private int totalFiles;
	private ArrayList<String> s3Keys;

	////////
	// public methods
	////////

	public DataSource() {
		this.s3Client = new AmazonS3Client(new ProfileCredentialsProvider());  
		this.s3Bucket = null;
		this.rootDirectoryCount = 0;
		this.canConnect = false;
		this.totalFiles = 0;
		this.s3Keys = new ArrayList<String>();
	}

	public AmazonS3 getS3Client() {
		return this.s3Client;
	}

	public String getS3Bucket() {
		return this.s3Bucket;
	}

	public void setS3Bucket(String bucket) {
		this.s3Bucket = bucket;
	}

	public ArrayList<String> getS3Keys() {
		return this.s3Keys;
	}

	public boolean canConnect() {
		return this.canConnect;
	}

	public int getTotalFiles() {
		return this.totalFiles;
	}

	public static void handleException(Exception ex, boolean exit) {
		System.out.println(ex.getClass().getName() + ": " + ex.getMessage());
		ex.printStackTrace();
		if (exit)
			System.exit(0);
	}

	public void updateS3Keys(){
		this.s3Keys = downloadS3DirectoryKeys(this.s3Bucket);
	}

	private int s3DirectoryCount(String path) {
		try {
			String command = "aws s3 ls s3://" + path + "/";
			Process process = Runtime.getRuntime().exec(command);
			String output = null;
			BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(process.getInputStream()));

			int count = 0;

			while ((output = bufferedReader.readLine()) != null) {

				if (count == 0)
					this.canConnect = true;

				count += 1;
			}
 
			return count;
		} catch (Exception ex) {
			handleException(ex, false);
			return -1;
		}
	}

	public ArrayList<String> downloadS3DirectoryKeys(String path) {
		ArrayList<String> keys = new ArrayList<String>();
		try {
			ListObjectsV2Request request = new ListObjectsV2Request().withBucketName(path);
			ListObjectsV2Result result;
			do {
				result = this.s3Client.listObjectsV2(request);
				for (S3ObjectSummary objectSummary : result.getObjectSummaries()) {
					// skip accelerometer data for now
					if (!objectSummary.getKey().contains("Accelerometer")) {
						keys.add(objectSummary.getKey());
					}
				}
				request.setContinuationToken(result.getNextContinuationToken());
			} while (result.isTruncated() == true);
		} catch (Exception ex) {
			handleException(ex, false);
		}

		return keys;
	}

	public int s3RootDirectoryCount() {
		this.rootDirectoryCount = s3DirectoryCount(this.s3Bucket);
		return this.rootDirectoryCount;
	}

	public void updateS3RootDirectoryCount() {
		this.rootDirectoryCount = s3DirectoryCount(this.s3Bucket);
	}

	public int s3SubDirectoryCount(String path) {
		return s3DirectoryCount(this.s3Bucket + "/" + path);
	}

	public JSONArray downloadS3Object(String path) {
		try {
			S3Object directory = this.s3Client.getObject(new GetObjectRequest(this.s3Bucket, path));
			InputStream objectData = directory.getObjectContent();
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			byte[] bytes = IOUtils.toByteArray(objectData);
			String content = "";

			// get the data from s3 and read it into a buffer, unzipping if it's compressed
			if (path.contains(".gz")) {
				try (ByteArrayInputStream bin = new ByteArrayInputStream(bytes);
					GZIPInputStream gzipStream = new GZIPInputStream(bin))
				{
					byte[] buffer = new byte[1024];
					out = new ByteArrayOutputStream();
					int length;

					while ((length = gzipStream.read(buffer)) > 0) {
						out.write(buffer, 0, length);
					}

					gzipStream.close();	
					out.close();
					bytes = out.toByteArray();
				}
			}

			return new JSONArray(new String(bytes, "UTF-8"));
		} catch (Exception ex) {
			handleException(ex, true);
			return null;
		}
	}
}

