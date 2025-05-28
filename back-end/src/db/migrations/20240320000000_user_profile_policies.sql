-- Enable RLS on user_profile table
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Policy for inserting own profile
CREATE POLICY "Users can insert their own profile"
ON user_profile
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for reading own profile
CREATE POLICY "Users can read their own profile"
ON user_profile
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for updating own profile
CREATE POLICY "Users can update their own profile"
ON user_profile
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for admins to read all profiles
CREATE POLICY "Admins can read all profiles"
ON user_profile
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profile
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
);

-- Policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON user_profile
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profile
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profile
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    )
); 